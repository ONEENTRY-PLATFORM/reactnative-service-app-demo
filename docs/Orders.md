[Back to README](../README.md)

# Orders (Booking) Documentation

Orders are a core module of the [OneEntry CMS](https://oneentry.cloud/), powering the booking functionality in this app. Here, it enables users to book beauty salon services by selecting a service, a master (specialist), a salon location, and a time slot. 
This document walks you through how the order creation process is implemented in the app, from gathering data to finalizing a booking.

For more details on the Orders module in OneEntry, see the [official documentation](https://doc.oneentry.cloud/docs/category/orders).

---

## Overview of the Booking Process

The booking process involves four main components:
1. **Service**: The beauty service the user wants (e.g., haircut, manicure).
2. **Master**: The specialist providing the service.
3. **Salon**: The location where the service will be performed.
4. **Time Slot**: The scheduled time for the appointment.

These components are collected in the app, stored temporarily in Redux, and then sent to the OneEntry CMS to create an order. Below, we’ll break down how this works step-by-step.

---

## Step 1: Collecting Booking Data in the App

### Managing State with Redux
- All booking data is stored in the Redux store using the `[OrderSlice]` reducer.
- As the user selects a master, service, salon, and time slot, these details are added to the state via Redux actions.
- File: `[OrderSlice]` - [../state/reducers/OrderSlice.ts](../state/reducers/OrderSlice.ts)

### Booking Screen
- The `[Booking Screen]` is where users manage the entire booking flow.
- After choosing a master and service (likely from earlier screens like the Masters or Services pages), the user lands here to pick a time slot.
- File: `[Booking Screen]` - [../app/(tabs)/booking.tsx](../app/(tabs)/booking.tsx)

### Flexible Time Slots
- Time selection is highly customizable thanks to OneEntry’s **Time Interval attribute**.
- Each master can have their own availability intervals (e.g., 60-minute slots, specific days).
- Learn more about configuring intervals in the [Time Interval documentation](https://doc.oneentry.cloud/docs/attributes/types#time-interval).

### Confirming the Booking
- Once all components (service, master, salon, time slot) are selected, the user clicks the `[ConfirmOrderButton]`.
- This triggers a redirect to the `[Order Processing]` screen to finalize the booking.
- File: `[ConfirmOrderButton]` - [../components/content/BookingScreen/ConfirmOrderButton.tsx](../components/content/BookingScreen/ConfirmOrderButton.tsx)

---

## Step 2: Finalizing the Order

### Order Processing Screen
- The `[Order Processing]` screen lets users choose their payment method: **cash** or **Stripe**.
- If Stripe is selected, a payment session is created (more on this below).
- File: `[Order Processing]` - [../app/(tabs)/order_processing.tsx](../app/(tabs)/order_processing.tsx)

### Creating the Order in OneEntry CMS
- The `[ProcessingActions]` component handles order submission:
    1. The `onSubmitOrder` method transforms the booking data from the Redux store into the format required by the OneEntry CMS.
    2. It then uses the OneEntry SDK to send the order to the CMS via an API call.
- File: `[ProcessingActions]` - [../components/content/OrderProccessing/ProcessingActions.tsx](../components/content/OrderProccessing/ProcessingActions.tsx)

### Handling Payments with Stripe
- If the user chooses Stripe:
    1. The `createPaymentSession` method (also in `[ProcessingActions]`) uses the OneEntry SDK to generate a payment session.
    2. A payment link is returned, and the app redirects the user to a WebView to complete the payment.
- For details on integrating Stripe with OneEntry, see the [Stripe documentation](https://doc.oneentry.cloud/docs/payments/stripe).

---

## Step 3: Viewing the Order

- Once created, all orders default to an **"upcoming"** status.
- Users can view their bookings in the `[Visits History Screen]`.
- File: `[Visits History Screen]` - [../app/(tabs)/visits_history.tsx](../app/(tabs)/visits_history.tsx)

---

## Key Files Recap

| Component                 | File Path                                                                                                                    | Purpose                            |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| OrderSlice                | [../state/reducers/OrderSlice.ts](../state/reducers/OrderSlice.ts)                                                           | Stores booking data in Redux       |
| Booking Screen            | [../app/(tabs)/booking.tsx](../app/(tabs)/booking.tsx)                                                                       | Manages the booking flow           |
| ConfirmOrderButton        | [../components/content/BookingScreen/ConfirmOrderButton.tsx](../components/content/BookingScreen/ConfirmOrderButton.tsx)     | Redirects to payment selection     |
| Order Processing          | [../app/(tabs)/order_processing.tsx](../app/(tabs)/order_processing.tsx)                                                     | Handles payment selection          |
| ProcessingActions         | [../components/content/OrderProccessing/ProcessingActions.tsx](../components/content/OrderProccessing/ProcessingActions.tsx) | Submits order and handles payments |
| Visits History Screen     | [../app/(tabs)/visits_history.tsx](../app/(tabs)/visits_history.tsx)                                                         | Displays user bookings             |

---

## Tips for Beginners

- **Start Small**: Try logging the Redux state in `[OrderSlice]` to see how data changes as you select a master or service.
- **Test Time Slots**: Play with the time interval settings in OneEntry CMS to understand how they affect availability on the `[Booking Screen]`.

---

This guide should give you a clear picture of how bookings work in the Service App. If you’re new to the project, take it one step at a time, and feel free to explore the linked files and OneEntry docs for more context!
