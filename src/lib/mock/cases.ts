/**
 * Sample cases for the attendee Chanda Mulenga (her Messages inbox) and the
 * buyer cases Zed Live Entertainment sees in Questions and help.
 */
import type { Case } from "@/lib/cases";

export const myCases: Case[] = [
  {
    number: "CS-2611-0409", type: "Help request", subject: "Ticket or entry problem at North gate", event: "Zambia Trade and Farm Expo", eventSlug: "zambia-trade-and-farm-expo", org: "Copperbelt Business Forum",
    status: "Answered", opened: "2026-11-18 09:20", closesOn: "2026-11-19T09:31:00+02:00", unread: 1,
    messages: [
      { from: "attendee", at: "09:20", text: "My week pass won't scan at North gate. It says 'not yet valid'." },
      { from: "system", at: "09:20", text: "Sent to the gate team." },
      { from: "team", name: "Kelvin (gate team)", at: "09:22", text: "I'm on my way. Please wait by the blue tent." },
      { from: "team", name: "Kelvin (gate team)", at: "09:24", text: "", call: { seconds: 74, by: "team" } },
      { from: "team", name: "Kelvin (gate team)", at: "09:31", text: "Sorted: your pass was set to start tomorrow by mistake. It now works all week. Enjoy the expo!" },
      { from: "system", at: "09:31", text: "Marked done. This chat closes 24 hours after the request is done." },
    ],
  },
  {
    number: "CS-2611-0405", type: "Refund or ticket problem", subject: "Can I upgrade my Standard tickets to VIP?", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", org: "Zed Live Entertainment",
    status: "Waiting for you", opened: "2026-11-16 18:02", closesOn: "2026-12-27", unread: 1,
    messages: [
      { from: "attendee", at: "16 Nov, 18:02", text: "Hi, can I upgrade my two Standard tickets to VIP and pay the difference?" },
      { from: "team", name: "Precious (Zed Live)", at: "17 Nov, 09:15", text: "Yes! The difference is K300 per ticket. Shall I send you a payment link for both?" },
    ],
  },
  {
    number: "CS-2610-0371", type: "Lost and found", subject: "Lost a grey jacket", event: "Zed Live Sessions: October", eventSlug: "lusaka-summer-jam-2026", org: "Zed Live Entertainment",
    status: "Closed", opened: "2026-10-24 23:10", closesOn: "2026-11-07", deletesOn: "2027-02-05",
    messages: [
      { from: "attendee", at: "24 Oct, 23:10", text: "I left a grey jacket near the bar." },
      { from: "team", name: "Chileshe (lost and found)", at: "25 Oct, 10:05", text: "We have it. Collect from our office at Arcades, Monday to Friday, 9 to 5. Quote CS-2610-0371." },
      { from: "attendee", at: "27 Oct, 12:40", text: "Collected, thank you!" },
      { from: "system", at: "7 Nov", text: "Chat closed 14 days after the event. Messages will be deleted on 5 Feb 2027; the case number and outcome are kept." },
    ],
  },
];

/** Buyer cases in Zed Live's Questions and help. */
export const orgCases: (Case & { buyer: string })[] = [
  {
    number: "CS-2611-0412", type: "Question", subject: "Is there parking at Heroes for Summer Jam?", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", org: "Zed Live Entertainment", buyer: "Natasha Phiri",
    status: "Open", opened: "2026-11-17 08:41", closesOn: "2026-12-27",
    messages: [{ from: "attendee", at: "17 Nov, 08:41", text: "Hi, is there secure parking at Heroes Stadium and do I need to pay?" }],
  },
  {
    number: "CS-2611-0405", type: "Refund or ticket problem", subject: "Can I upgrade my Standard tickets to VIP?", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", org: "Zed Live Entertainment", buyer: "Chanda Mulenga",
    status: "Answered", opened: "2026-11-16 18:02", closesOn: "2026-12-27",
    messages: [
      { from: "attendee", at: "16 Nov, 18:02", text: "Hi, can I upgrade my two Standard tickets to VIP and pay the difference?" },
      { from: "team", name: "Precious (you)", at: "17 Nov, 09:15", text: "Yes! The difference is K300 per ticket. Shall I send you a payment link for both?" },
    ],
  },
  {
    number: "CS-2611-0398", type: "Complaint", subject: "Charged twice for one ticket", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", org: "Zed Live Entertainment", buyer: "Joseph Tembo",
    status: "Open", opened: "2026-11-15 20:12", closesOn: "2026-12-27",
    messages: [
      { from: "attendee", at: "15 Nov, 20:12", text: "MTN took K500 twice but I only got one ticket." },
      { from: "team", name: "Daliso", at: "15 Nov, 20:30", text: "", call: { seconds: 0, by: "team" } },
      { from: "system", at: "15 Nov, 20:31", text: "Missed call. Daliso asked to be called back." },
    ],
  },
  {
    number: "CS-2611-0390", type: "Question", subject: "Can my 12-year-old come with a Standard ticket?", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", org: "Zed Live Entertainment", buyer: "Mutinta Hamoonga",
    status: "Answered", opened: "2026-11-15 17:02", closesOn: "2026-12-27",
    messages: [
      { from: "attendee", at: "15 Nov, 17:02", text: "Can children attend?" },
      { from: "team", name: "Daliso", at: "15 Nov, 19:30", text: "Yes, under-16s must come with an adult and need their own Standard ticket." },
    ],
  },
];
