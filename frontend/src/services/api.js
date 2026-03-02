const API_URL = "/api"; // because of proxy

export async function register(user){
  const res = await fetch(`${API_URL}/auth/register`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(user)
  });
  return res.json();
}

export async function login(data){
  const res = await fetch(`${API_URL}/auth/login`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  });
  return res.json();
}

export async function getPolicies(){
  const res = await fetch(`${API_URL}/policies`);
  return res.json();
}

export async function createPolicy(token, policy){
  const res = await fetch(`${API_URL}/policies`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer " + token
    },
    body:JSON.stringify(policy)
  });
  return res.json();
}

export async function submitClaim(token, claim){
  const res = await fetch(`${API_URL}/claims`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer " + token
    },
    body:JSON.stringify(claim)
  });
  return res.json();
}

export async function getClaims(token){
  const res = await fetch(`${API_URL}/claims`, {
    headers:{
      "Authorization":"Bearer " + token
    }
  });
  return res.json();
}

export async function updateClaimStatus(token, claimId, status){
  const res = await fetch(`${API_URL}/claims/${claimId}/status`, {
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer " + token
    },
    body:JSON.stringify({ status })
  });
  return res.json();
}