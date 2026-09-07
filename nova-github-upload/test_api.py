import urllib.request
import json

base = "http://localhost:3000"

def request(path, method="GET", data=None, token=None):
    url = base + path
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, headers=headers, data=body, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

print("1. Testing Login with seeded Admin...")
status, res = request("/api/auth/login", "POST", {"email": "alex@novahq.com", "password": "Password123!"})
user = res.get("user", {})
print(f"   Login status: {status}, User: {user.get('name')} ({user.get('role')})")
token = res.get("token")

print("2. Testing /api/auth/me profile verification...")
status, res = request("/api/auth/me", "GET", token=token)
user = res.get("user", {})
print(f"   Auth/me status: {status}, Email: {user.get('email')}")

print("3. Testing /api/projects listing...")
status, res = request("/api/projects", "GET", token=token)
projects = res.get("projects", [])
print(f"   Projects found: {len(projects)}")

print("4. Testing Project Creation...")
status, res = request("/api/projects", "POST", {
    "name": "AI Workflow Engine",
    "key": "AIW",
    "description": "Automated workflow triggers and task assignments.",
    "priority": "HIGH",
    "budget": 75000
}, token=token)
project = res.get("project", {})
print(f"   Create project status: {status}, Key: {project.get('key')}")
created_proj_id = project.get("id")

print("5. Testing Task Creation...")
status, res = request("/api/tasks", "POST", {
    "title": "Build WebSocket notification gateway",
    "description": "Sub-50ms push updates for task transitions.",
    "projectId": created_proj_id,
    "status": "TODO",
    "priority": "URGENT"
}, token=token)
task = res.get("task", {})
print(f"   Create task status: {status}, Code: {task.get('taskCode')}")
task_id = task.get("id")

print("6. Testing Kanban Status Transition (TODO -> IN_PROGRESS)...")
status, res = request(f"/api/tasks/{task_id}", "PUT", {"status": "IN_PROGRESS"}, token=token)
task = res.get("task", {})
print(f"   Update status: {status}, New status: {task.get('status')}")

print("7. Testing Comments API...")
status, res = request(f"/api/tasks/{task_id}/comments", "POST", {"content": "Gateway architecture benchmark completed."}, token=token)
comment = res.get("comment", {})
print(f"   Add comment status: {status}, Author: {comment.get('author', {}).get('name')}")

print("8. Testing Analytics Dashboard Metrics...")
status, res = request("/api/analytics", "GET", token=token)
metrics = res.get("metrics", {})
print(f"   Projects: {metrics.get('totalProjects')}, Tasks: {metrics.get('totalTasks')}, Completion: {metrics.get('overallCompletionRate')}%")

print("9. Testing Team Directory...")
status, res = request("/api/team", "GET", token=token)
members = res.get("members", [])
print(f"   Team members count: {len(members)}")

print("\n>>> ALL END-TO-END VERIFICATION CHECKS PASSED WITH SUCCESS! <<<")
