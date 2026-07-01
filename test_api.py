import jwt
import requests

secret = "super-secret-internal-key-for-dev"
token = jwt.encode({"userId": "test@example.com", "email": "test@example.com"}, secret, algorithm="HS256")

headers = {"Authorization": f"Bearer {token}"}

# Test POST /onboard
res1 = requests.post("https://cpflow-api.onrender.com/api/users/onboard", json={"name": "Test User"}, headers=headers)
print("POST /onboard:", res1.status_code, res1.text)

# Test GET /profile
res2 = requests.get("https://cpflow-api.onrender.com/api/users/profile", headers=headers)
print("GET /profile:", res2.status_code, res2.text)
