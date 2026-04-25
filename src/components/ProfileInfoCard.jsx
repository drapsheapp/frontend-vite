import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const ProfileInfoCard = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardContent className="p-6 space-y-2">
        <p><b>Name:</b> {user?.name}</p>
        <p><b>Email:</b> {user?.email}</p>
        <Badge>{user?.role}</Badge>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoCard;