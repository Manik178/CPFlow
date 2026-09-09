import httpx
import asyncio

payload = {
    "language": "c++",
    "version": "10.2.0",
    "files": [{"content": """
#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t = 1;
    cout<<t;
}
"""}],
    "stdin": "5\n2 2 2 2 2\n",
    "run_timeout": 3000,
    "compile_timeout": 10000
}

async def main():
    async with httpx.AsyncClient() as client:
        resp = await client.post("http://localhost:2000/api/v2/execute", json=payload)
        print(resp.json())

asyncio.run(main())
