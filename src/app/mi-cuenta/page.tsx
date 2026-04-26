import { redirect } from "next/navigation";

type CustomerAccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomerAccountPage({
  searchParams,
}: CustomerAccountPageProps) {
  const params = await searchParams;
  const targetParams = new URLSearchParams({
    account: "dashboard",
  });
  const rawMessage = params.message;
  const rawTone = params.tone;
  const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
  const tone = Array.isArray(rawTone) ? rawTone[0] : rawTone;

  if (message) {
    targetParams.set("message", message);
  }

  if (tone) {
    targetParams.set("tone", tone);
  }

  redirect(`/?${targetParams.toString()}`);
}
