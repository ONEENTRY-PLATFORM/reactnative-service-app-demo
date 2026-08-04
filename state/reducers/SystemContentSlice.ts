import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// UI-strings dictionary. Sourced from OneEntry's `system_content` attribute-set
// (matches nextjs-beauty — see RN_ADAPTATION_PLAN.md § "Категория B"). Values
// are stored as-is under the attribute marker; consumers use content.<marker>.
type ContentType = {[key: string]: any};

type initialStateType = {
  content: ContentType;
};

const initialState: initialStateType = {
  content: {},
};

type IncomingAttribute = {
  marker: string;
  localizeInfos?: {value?: any} | null;
};

const SystemContentSlice = createSlice({
  name: 'system-content',
  initialState,
  reducers: {
    // Payload is an IAttributeSetsEntity[] as returned by
    // AttributesSets.getAttributesByMarker('system_content'). We keep the raw
    // localizeInfos.value so components can decide how to interpret it (string,
    // rich object, file, etc.) — that's what web does.
    addSystemContent(state, action: PayloadAction<IncomingAttribute[] | null | undefined>) {
      const items = action.payload ?? [];
      const next: ContentType = {};
      for (const item of items) {
        if (item?.marker) {
          next[item.marker] = item.localizeInfos?.value;
        }
      }
      state.content = {...state.content, ...next};
    },

    // Kept for backwards-compat with any lingering caller that still merges a
    // separate 'static_content' attribute-set. Web uses only 'system_content'
    // now, so this is a no-op-friendly path that should eventually be removed.
    addStaticContent(state, action: PayloadAction<IncomingAttribute[]>) {
      const items = action.payload ?? [];
      for (const item of items) {
        if (item?.marker) {
          state.content[item.marker] = item.localizeInfos?.value;
        }
      }
    },
  },
});

export const {addSystemContent, addStaticContent} = SystemContentSlice.actions;
export default SystemContentSlice.reducer;
