import { fetchProfile } from "./actions";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const profile = await fetchProfile();

  return (
    <div className="space-y-6">
      <ProfileForm initialProfile={profile} />
      <form action={signOut}>
        <Button type="submit" variant="outline">
          로그아웃
        </Button>
      </form>
    </div>
  );
}
