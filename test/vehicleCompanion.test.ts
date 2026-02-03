import { render, screen, fireEvent } from '@testing-library/react';
import { AddVehicleDialog } from '../src/components/vehicles/AddVehicleDialog';
import { PdfUpload } from '../src/components/documents/PdfUpload';
import { OBDExplanation } from '../src/components/vehicles/OBDExplanation';
import { DiagnosticAssistant } from '../src/components/vehicles/DiagnosticAssistant';
import { MaintenanceRecommendations } from '../src/components/vehicles/MaintenanceRecommendations';
import { MaintenanceChat } from '../src/components/vehicles/MaintenanceChat';
import { History } from '../src/components/vehicles/History';

// Test for vehicle registration
describe('Vehicle Registration', () => {
    test('should register a vehicle with essential data', () => {
        render(<AddVehicleDialog />);
        // Simulate filling the form and submitting
        fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Carro X' } });
        fireEvent.change(screen.getByLabelText(/ano/i), { target: { value: '2020' } });
        fireEvent.click(screen.getByText(/cadastrar/i));
        expect(screen.getByText(/veículo cadastrado com sucesso/i)).toBeInTheDocument();
    });
});

// Test for PDF upload
describe('PDF Upload', () => {
    test('should upload a PDF manual for better responses', () => {
        render(<PdfUpload />);
        const file = new File(['dummy content'], 'manual.pdf', { type: 'application/pdf' });
        fireEvent.change(screen.getByLabelText(/upload manual/i), { target: { files: [file] } });
        expect(screen.getByText(/manual enviado com sucesso/i)).toBeInTheDocument();
    });
});

// Test for OBD-II explanation
describe('OBD-II Explanation', () => {
    test('should explain OBD-II codes in simple language', () => {
        render(<OBDExplanation code='P0420' />);
        expect(screen.getByText(/código P0420 significa/i)).toBeInTheDocument();
    });
});

// Test for diagnostic assistance
describe('Diagnostic Assistance', () => {
    test('should provide assisted diagnosis with hypotheses and checklist', () => {
        render(<DiagnosticAssistant />);
        fireEvent.click(screen.getByText(/iniciar diagnóstico/i));
        expect(screen.getByText(/verifique os seguintes itens/i)).toBeInTheDocument();
    });
});

// Test for maintenance recommendations
describe('Maintenance Recommendations', () => {
    test('should recommend preventive maintenance', () => {
        render(<MaintenanceRecommendations />);
        expect(screen.getByText(/recomendações de manutenção/i)).toBeInTheDocument();
    });
});

// Test for maintenance chat
describe('Maintenance Chat', () => {
    test('should allow chat based on the manual', () => {
        render(<MaintenanceChat />);
        fireEvent.change(screen.getByLabelText(/mensagem/i), { target: { value: 'Como trocar o óleo?' } });
        fireEvent.click(screen.getByText(/enviar/i));
        expect(screen.getByText(/a troca de óleo deve ser feita a cada 5.000 km/i)).toBeInTheDocument();
    });
});

// Test for history of queries and documents
describe('History of Queries and Documents', () => {
    test('should display history of queries and documents', () => {
        render(<History />);
        expect(screen.getByText(/histórico de consultas/i)).toBeInTheDocument();
    });
});
