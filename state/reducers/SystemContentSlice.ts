import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type ContentType = {
  select_master_text?: string;
  check_profile_text?: string;
  apply_text?: string;
  save_button_text?: string;
  select_salon_text?: string;
  select_service_text?: string;
  select_text?: string;
  master_text?: string;
  book_online_text?: string;
  master_experience_text?: string;
  create_account_text?: string;
  round_logo?: string;
  authorize_text?: string;
  sign_up_text?: string;
  sign_in_text?: string;
  incorrect_inputs_text?: string;
  phone_text?: string;
  exit_text?: string;
  oneentry_logo?: string;
  [key: string]: any;
};

type initialStateType = {
  content: ContentType;
};

const initialState: initialStateType = {
  content: [],
};

const SystemContentSlice = createSlice({
  name: 'catalog-categories',
  initialState,
  reducers: {
    addSystemContent(state, action: PayloadAction<any>) {
      const attributes = action.payload;
      state.content = {
        select_master_text: attributes?.select_master_text?.value,
        check_profile_text: attributes?.check_profile_text?.value,
        apply_text: attributes?.apply_text?.value,
        save_button_text: attributes?.save_button_text?.value,
        select_salon_text: attributes?.select_salon_text?.value,
        select_service_text: attributes?.select_service_text?.value,
        select_text: attributes?.select_text?.value,
        master_text: attributes?.master_text?.value,
        book_online_text: attributes?.book_online_text?.value,
        master_experience_text: attributes?.master_experience_text?.value,
        create_account_text: attributes?.create_account_text?.value,
        privacy_policy_text: attributes?.privacy_policy_text?.value,
        welcome_message_text: attributes?.welcome_message_text?.value,
        round_logo: attributes?.round_logo?.value[0].downloadLink,
        authorize_text: attributes?.authorize_text?.value,
        password_input_title_text: attributes?.password_input_title_text?.value,
        current_master_text: attributes?.current_master_text?.value,
        sign_up_text: attributes?.sign_up_text?.value,
        sign_in_text: attributes?.sign_in_text?.value,
        incorrect_inputs_text: attributes?.incorrect_inputs_text?.value,
        phone_text: attributes?.phone_text?.value,
        exit_text: attributes?.exit_text?.value,
        reset_password_text: attributes?.reset_password_text?.value,
        forgot_password_text: attributes?.forgot_password_text?.value,
        verify_now_text: attributes?.verify_now_text?.value,
        enter_otp_code: attributes?.enter_otp_code?.value,
        receive_otp_text: attributes?.receive_otp_text?.value,
        resend_text: attributes?.resend_text?.value,
        first_order_text: attributes?.first_order_text?.value,
        oneentry_logo: attributes?.oneentry_logo?.value[0]?.downloadLink,
        terms_agreement: attributes?.terms_agreement?.value,
        smth_wrong_text: attributes?.smth_wrong_text?.value,
        try_again_text: attributes?.try_again_text?.value,
        reset_pass_description: attributes?.reset_pass_description?.value,
        send_text: attributes?.send_text?.value,
        verification: attributes?.verification?.value,
      };
    },
  },
});

export const {addSystemContent} = SystemContentSlice.actions;
export default SystemContentSlice.reducer;
