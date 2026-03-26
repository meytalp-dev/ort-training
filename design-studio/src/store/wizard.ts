import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorPalette, DesignStyle, FontCombo, ButtonStyle, OutputSize } from '@/data/studio';
import type { EntryMode } from '@/components/EntryScreen';

export type ProductType = 'post' | 'invitation' | 'worksheet' | 'business-card' | 'landing' | 'presentation' | null;

export type OrgInfo = {
  name: string;
  role: string;
  phone: string;
  email: string;
  logoUrl: string | null;
};

const emptyOrg: OrgInfo = { name: '', role: '', phone: '', email: '', logoUrl: null };

type WizardState = {
  entryMode: EntryMode | null;
  step: number;
  palette: ColorPalette | null;
  style: DesignStyle | null;
  fontCombo: FontCombo | null;
  buttonStyle: ButtonStyle | null;
  outputs: OutputSize[];
  selectAll: boolean;
  activeProduct: ProductType;
  orgInfo: OrgInfo;
  setEntryMode: (mode: EntryMode | null) => void;
  setStep: (step: number) => void;
  setPalette: (p: ColorPalette) => void;
  setStyle: (s: DesignStyle) => void;
  setFontCombo: (f: FontCombo) => void;
  setButtonStyle: (b: ButtonStyle) => void;
  setOutputs: (o: OutputSize[]) => void;
  setSelectAll: (v: boolean) => void;
  setActiveProduct: (p: ProductType) => void;
  setOrgInfo: (info: Partial<OrgInfo>) => void;
  reset: () => void;
};

export const useWizard = create<WizardState>()(
  persist(
    (set) => ({
      entryMode: null,
      step: 0,
      palette: null,
      style: null,
      fontCombo: null,
      buttonStyle: null,
      outputs: [],
      selectAll: false,
      activeProduct: null,
      orgInfo: emptyOrg,
      setEntryMode: (entryMode) => set({ entryMode }),
      setStep: (step) => set({ step }),
      setPalette: (palette) => set({ palette }),
      setStyle: (style) => set({ style }),
      setFontCombo: (fontCombo) => set({ fontCombo }),
      setButtonStyle: (buttonStyle) => set({ buttonStyle }),
      setOutputs: (outputs) => set({ outputs }),
      setSelectAll: (selectAll) => set({ selectAll }),
      setActiveProduct: (activeProduct) => set({ activeProduct }),
      setOrgInfo: (info) => set((s) => ({ orgInfo: { ...s.orgInfo, ...info } })),
      reset: () => set({ entryMode: null, step: 0, palette: null, style: null, fontCombo: null, buttonStyle: null, outputs: [], selectAll: false, activeProduct: null, orgInfo: emptyOrg }),
    }),
    {
      name: 'design-studio-wizard',
      partialize: (state) => ({
        entryMode: state.entryMode,
        step: state.step,
        palette: state.palette,
        style: state.style,
        fontCombo: state.fontCombo,
        buttonStyle: state.buttonStyle,
        outputs: state.outputs,
        selectAll: state.selectAll,
        orgInfo: state.orgInfo,
      }),
    }
  )
);
