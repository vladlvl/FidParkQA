import { test, expect, request } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const clientId = 4624; //hard coded value
const baseURL = process.env.BASE_URL;
const authToken = process.env.AUTH_TOKEN;
let token: string;
let createdClientId: number; //dynamic client id


//runs before each call to generate a token 
test.beforeAll(async ({ request }) => {
  const loginRes = await request.post(`${baseURL}/api/v1/Account/login`, {
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD
    }
  });

  expect(loginRes.ok()).toBeTruthy();
  const body = await loginRes.json();
  token = body.Token;

  console.log('Token:', token.slice(0, 15) + '....');
});

//get all clients 2 tests: 1. get clients OK, 2.unautharised 401
test('GET all clients', async ({ request }) => {
  const res = await request.get(`${baseURL}/api/v1/clients/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  expect(res.ok()).toBeTruthy();
  const clients = await res.json();
  //console.log('Clients:', clients); //prints all the clients
  expect(clients.value.length).toBeGreaterThan(10); //assertion that the number of clients returned is positive >10
});

test('Unauthorized GET all clients 401', async ({ request }) => {
  const res = await request.get(`${baseURL}/api/v1/clients/`);
  const status = res.status();
  console.log('Unauthorized request status:', status);

  expect(status).toBe(401);
});



//get number of clients 2 tests: 1. get number OK, 2. unautharised 401
test('GET total number of clients', async ({ request }) => {
 
  const countRes = await request.get(`${baseURL}/api/v1/Clients/$count`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const countText = await countRes.text();
  const count = parseInt(countText, 10);

  console.log('Total clients:', count);
  expect(countRes.ok()).toBeTruthy();
  expect(count).toBeGreaterThanOrEqual(0);
});

test('GET total number of clients unauth - should return 401', async ({ request }) => {
  const res = await request.get(`${baseURL}/api/v1/Clients/$count`);

  const status = res.status();
  console.log('Unauthorized request status:', status);
  expect(status).toBe(401); 
});


//create a client 3 tests: create OK, wrong data 400, not auth 401
test('POST create a client', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/v1/Clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify( {
      LastNameOrCompany: 'QA',
      FirstName: 'AutomationNEW',
      Email: 'qa@test.com',
      Mobile: '12312323',
      ClientTypeCode: 1 
    })
  });

  const status = response.status();
  const body = await response.json();

  console.log('Status:', status);
  console.log('Created client:', body);

  expect(response.ok()).toBeTruthy();
  createdClientId = body.clientID;;
  console.log('Stored createdClientId:', createdClientId);
});

test('POST create a client with invalid data 400', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/v1/Clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({}) //empty body
  });

  const status = response.status();
  const body = await response.text();

  console.log('Status:', status);


  expect(status).toBe(400);
});

test('POST create a client not authorized 401', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/v1/Clients`, {
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      LastNameOrCompany: 'QA',
      FirstName: 'Automation',
      Email: 'qa@test.com',
      Mobile: '12312323',
      ClientTypeCode: 1 
    })
  });

  const status = response.status();
  console.log('Status:', status);

  expect(status).toBe(401); 
});

//get a client by ClientID 2 tests: 1. GET OK, 2. 401 not auth. Used dynamic variable that is generated from the previous tests, so it's better to use only when running all tests (not individually)
test(`GET /Clients/$ - fetch client by ID`, async ({ request }) => {
  const res = await request.get(`${baseURL}/api/v1/Clients/${createdClientId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  console.log("Created client id", createdClientId);
  const status = res.status();
  const body = await res.json();

  console.log('Client info:', body);
  console.log('Status:', status);

  expect(res.ok()).toBeTruthy();
});

test('GET /Clients/{id} without auth - should return 401', async ({ request }) => {
  const res = await request.get(`${baseURL}/api/v1/Clients/${createdClientId}`);

  const status = res.status();
  const body = await res.text();
  console.log('Status:', status);

  expect(status).toBe(401); 
});


//patch 2 tests. 1. Update a client by its ID 2. Invalid data 400
test('PATCH update client by the ID', async ({ request }) => {
  
  const res = await request.patch(`${baseURL}/api/v1/Clients/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      LastNameOrCompany: 'QA2',
      FirstName: 'Automation',
      Email: 'qa@test.com',
      Mobile: '12312323111',
      ClientTypeCode: 1
    })
  });

  const status = res.status();
  const body = await res.text();
  console.log('PUT response:', body);
  console.log('Full URL:', `${baseURL}/api/v1/Clients/${clientId}`);
  console.log('PATCH status:', status);
  expect(res.ok()).toBeTruthy();
});

test('PATCH update client by the ID- invalid data', async ({ request }) => {
  const res = await request.patch(`${baseURL}/api/v1/Clients/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      InvalidFieldName: 'test9999'
    })
  });

  const status = res.status();
  console.log('PATCH status:', status);

  expect(status).toBe(400); 
});

//put - replace
test('PUT /Clients/{id} - replace full client object', async ({ request }) => {
  const res = await request.put(`${baseURL}/api/v1/Clients/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      clientID: clientId,
      LastNameOrCompany: 'QA',
      FirstName: 'AutomationPUT',
      Email: 'qa@put.com',
      Mobile: '999888777',
      ClientTypeCode: 1,
    })
  });

  const status = res.status();
  const body = await res.text();

  console.log('PUT status:', status);
  console.log('PUT response:', body);

  expect(res.ok()).toBeTruthy();
});

//Delete: two calls 1. to delete recently created user, 2. to confirm the deleted user returns 404
test('DELETE the created client', async ({ request }) => {
  console.log('client ID:', createdClientId);

  const response = await request.delete(`${baseURL}/api/v1/Clients/${createdClientId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const status = response.status();

  console.log('DELETE status:', status);
  console.log('Full URL:', `${baseURL}/api/v1/Clients/${createdClientId}`);
  expect(response.ok()).toBeTruthy();
  const getResponse = await request.get(`${baseURL}/api/v1/Clients/${createdClientId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const getStatus = getResponse.status();
  console.log('status after deletion', getStatus);
  expect(getStatus).toBe(404); // Confirms the client no longer exists
});

