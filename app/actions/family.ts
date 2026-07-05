"use server";

import { revalidatePath } from "next/cache";
import {
  inviteFamilyMember as inviteFamilyMemberImpl,
  revokeFamilyInvite as revokeFamilyInviteImpl,
  removeFamilyMember as removeFamilyMemberImpl,
  leaveFamilyGroup as leaveFamilyGroupImpl,
  joinFamilyByToken as joinFamilyByTokenImpl,
  type InviteResult,
} from "@/lib/family";

export async function inviteFamilyMember(email: string): Promise<InviteResult> {
  const res = await inviteFamilyMemberImpl(email);
  if (res.ok) revalidatePath("/dashboard/settings");
  return res;
}

export async function revokeFamilyInvite(inviteId: string): Promise<InviteResult> {
  const res = await revokeFamilyInviteImpl(inviteId);
  if (res.ok) revalidatePath("/dashboard/settings");
  return res;
}

export async function removeFamilyMember(memberUserId: string): Promise<InviteResult> {
  const res = await removeFamilyMemberImpl(memberUserId);
  if (res.ok) revalidatePath("/dashboard/settings");
  return res;
}

export async function leaveFamilyGroup(): Promise<InviteResult> {
  const res = await leaveFamilyGroupImpl();
  if (res.ok) {
    revalidatePath("/dashboard", "layout");
  }
  return res;
}

export async function joinFamilyByToken(token: string): Promise<InviteResult> {
  const res = await joinFamilyByTokenImpl(token);
  if (res.ok) {
    revalidatePath("/dashboard", "layout");
  }
  return res;
}
