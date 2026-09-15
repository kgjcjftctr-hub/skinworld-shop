import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShippingAddress {
  nombre: string;
  telefono: string;
  codigoPostal: string;
  estado: string;
  municipio: string;
  colonia: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  referencias: string;
}

export const emptyShippingAddress: ShippingAddress = {
  nombre: '',
  telefono: '',
  codigoPostal: '',
  estado: '',
  municipio: '',
  colonia: '',
  calle: '',
  numeroExterior: '',
  numeroInterior: '',
  referencias: '',
};

const REQUIRED_FIELDS: (keyof ShippingAddress)[] = [
  'nombre',
  'telefono',
  'codigoPostal',
  'estado',
  'municipio',
  'colonia',
  'calle',
  'numeroExterior',
];

export function isShippingAddressComplete(address: ShippingAddress): boolean {
  return REQUIRED_FIELDS.every((field) => address[field].trim().length > 0);
}

interface ShippingAddressStore {
  address: ShippingAddress;
  setAddress: (address: ShippingAddress) => void;
  updateField: (field: keyof ShippingAddress, value: string) => void;
}

export const useShippingAddress = create<ShippingAddressStore>()(
  persist(
    (set) => ({
      address: emptyShippingAddress,
      setAddress: (address) => set({ address }),
      updateField: (field, value) =>
        set((state) => ({ address: { ...state.address, [field]: value } })),
    }),
    {
      name: 'skinworld-shipping-address',
    }
  )
);
