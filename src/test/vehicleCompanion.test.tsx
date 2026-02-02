import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { AddVehicleDialog } from '@/components/vehicles/AddVehicleDialog';
import { PdfUpload } from '@/components/documents/PdfUpload';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}
import OBDLookup from '@/pages/OBDLookup';
import Diagnosis from '@/pages/Diagnosis';
import Maintenance from '@/pages/Maintenance';
import VehicleDetail from '@/pages/VehicleDetail';
import { AIResponseDisplay } from '@/components/ai/AIResponseDisplay';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mocks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

const toastMock = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

// allow tests to change the returned data at runtime
let mockVehicleDocumentData: any = null;
let mockVehicleData: any = null;
const mockMutate = vi.fn((_payload, opts) => opts?.onSuccess && opts.onSuccess());
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/hooks/useVehicles', () => ({
  useVehicles: () => ({ data: [] }),
  useVehicle: (vehicleId?: string) => ({ data: mockVehicleData || null }),
  useVehicleDocument: (vehicleId?: string) => ({ data: mockVehicleDocumentData || null }),
  useCreateVehicle: () => ({ mutate: mockMutate, isPending: false }),
  useUpdateVehicle: () => ({ mutate: mockUpdate }),
  useDeleteVehicle: () => ({ mutate: mockDelete, isPending: false }),
}));

// Mock supabase functions invocation
const invokeMock = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => invokeMock(...args),
    },
    storage: {
      from: () => ({ upload: vi.fn().mockResolvedValue({}) }),
    },
    from: () => ({ insert: vi.fn().mockResolvedValue({}) }),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Vehicle Companion happy-path tests', () => {
  it('registers a vehicle with essential data', async () => {
    renderWithProviders(<AddVehicleDialog />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /adicionar veículo/i }));

    // Fill required name and other fields
    fireEvent.change(screen.getByLabelText(/Nome do veículo/i), { target: { value: 'Meu Civic' } });
    fireEvent.change(screen.getByLabelText(/Modelo/i), { target: { value: 'Civic' } });
    fireEvent.change(screen.getByLabelText(/Ano/i), { target: { value: '2020' } });

    fireEvent.click(screen.getByRole('button', { name: /^Adicionar$/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Veículo adicionado' }));
    });
  });

  it('displays selected PDF file and shows upload button', async () => {
    const { container } = renderWithProviders(<PdfUpload vehicleId="v1" />);

    const file = new File(['dummy pdf'], 'manual.pdf', { type: 'application/pdf' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    // File name should be displayed
    expect(await screen.findByText(/manual.pdf/i)).toBeInTheDocument();

    // Upload button should appear
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('validates and explains OBD-II code using AI response', async () => {
    // Mock document ready and supabase response
    // set document ready
    mockVehicleDocumentData = { id: 'doc1', status: 'ready' };

    invokeMock.mockResolvedValue({ data: {
      sections: [{ type: 'text', title: 'Explicação', content: 'O código P0420 significa que o catalisador está ineficiente.' }],
      base_used: null,
      disclaimer: null,
    } });

    renderWithProviders(
      <Routes>
        <Route path="/obd" element={<OBDLookup />} />
      </Routes>,
      { route: '/obd?vehicle=v1' }
    );

    const input = screen.getByPlaceholderText(/Ex: P0300/i);
    fireEvent.change(input, { target: { value: 'P0420' } });
    fireEvent.click(screen.getByRole('button', { name: /Explicar com IA/i }));

    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalled();
      expect(screen.getByText(/O código P0420 significa/i)).toBeInTheDocument();
    });
  });

  it('provides diagnostic assistance with hypotheses and checklist', async () => {
    // Mock document ready and supabase response
    // set document ready
    mockVehicleDocumentData = { id: 'doc1', status: 'ready' };

    invokeMock.mockResolvedValue({ data: {
      sections: [
        { type: 'list', title: 'Hipóteses', content: ['Vela de ignição', 'Bobina de ignição'] },
        { type: 'checklist', title: 'Checklist', content: ['Verifique velas', 'Verifique bobinas'] },
      ],
      base_used: null,
      disclaimer: null,
    } });

    renderWithProviders(
      <Routes>
        <Route path="/diagnosis" element={<Diagnosis />} />
      </Routes>,
      { route: '/diagnosis?vehicle=v1' }
    );
    const textarea = screen.getByPlaceholderText(/Ex: O carro está fazendo um barulho estranho/i);
    fireEvent.change(textarea, { target: { value: 'O carro apresenta falha ao acelerar e consumo alto.'.repeat(2) } });
    fireEvent.click(screen.getByRole('button', { name: /Gerar diagnóstico com IA/i }));

    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalled();
      expect(screen.getByText(/Verifique velas/i) || screen.getByText(/Vela de ignição/i)).toBeInTheDocument();
    });
  });

  it('renders maintenance recommendations via AIResponseDisplay', async () => {
    const response = {
      sections: [
        { type: 'text', title: 'Recomendações de Manutenção', content: 'Troque óleo a cada 5.000 km' }
      ],
      base_used: null,
      disclaimer: null,
    } as any;

    render(<AIResponseDisplay response={response} />);

    expect(screen.getByText(/Recomendações de Manutenção/i)).toBeInTheDocument();
    expect(screen.getByText(/Troque óleo a cada 5.000 km/i)).toBeInTheDocument();
  });

  it('allows maintenance chat based on the manual', async () => {
    const useVehicles = await import('@/hooks/useVehicles');
    mockVehicleDocumentData = { id: 'doc1', status: 'ready', file_name: 'manual.pdf' };
    invokeMock.mockResolvedValue({ data: { content: 'A troca de óleo deve ser feita a cada 5.000 km' } });

    renderWithProviders(
      <Routes>
        <Route path="/maintenance" element={<Maintenance />} />
      </Routes>,
      { route: '/maintenance?vehicle=v1' }
    );

    const input = await screen.findByPlaceholderText(/Pergunte sobre manutenção/i);
    fireEvent.change(input, { target: { value: 'Como trocar o óleo?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalled();
      expect(screen.getByText(/troca de óleo deve ser feita a cada 5.000 km/i)).toBeInTheDocument();
    });
  });

  it('displays available queries on vehicle detail when PDF present', async () => {
    // Mock hooks to provide vehicle and document
    mockVehicleData = { id: 'v1', name: 'Carro Teste', brand: 'X', model: 'Y', year: 2020, current_mileage: 100 };
    mockVehicleDocumentData = { id: 'doc1', status: 'ready', file_name: 'manual.pdf', file_size: 1000, uploaded_at: new Date().toISOString() };

    renderWithProviders(
      <Routes>
        <Route path="/vehicles/:vehicleId" element={<VehicleDetail />} />
      </Routes>,
      { route: '/vehicles/v1' }
    );

    expect(await screen.findByText(/Consultas disponíveis/i)).toBeInTheDocument();
  });
});
