import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        try:
            # 1. Register student
            resp = await client.post('/students/', json={'name': 'Verify Student', 'roll_number': 'V101', 'class_name': 'CS101', 'section': 'A'})
            student_id = resp.json()['id']
            print(f'Student registered: {student_id}')

            # 2. Test report endpoint
            resp = await client.get('/attendance/report', params={'class_name': 'CS101'})
            print(f'Report response: {resp.status_code}')

            # 3. Test student history
            resp = await client.get(f'/attendance/student/{student_id}')
            print(f'History response: {resp.status_code}')
        except Exception as e:
            print(f'Error: {e}')

if __name__ == '__main__':
    asyncio.run(test())
