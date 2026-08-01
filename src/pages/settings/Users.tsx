import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

function Users() {
  const session = useAuth((s) => s.session);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <Card>
        <CardHeader><CardTitle>Signed-in Admin</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div><span className="text-muted-foreground">Username:</span> {session?.username || "—"}</div>
          <div><span className="text-muted-foreground">Role:</span> Admin</div>
          <p className="text-muted-foreground pt-2">
            The backend currently exposes a single admin login (<code>/admin/login</code>). Multi-user
            management will appear here once user endpoints are added to the API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Users;
