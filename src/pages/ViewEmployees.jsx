import React, { useEffect, useState } from "react";

export default function ViewEmployees() {

  const [employees, setEmployees] = useState([]);

  // Add employee form state
  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ===============================
     FETCH EMPLOYEES
     NOTE: fixed route → /admin/employees
  ================================= */

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* ===============================
     ADD EMPLOYEE
  ================================= */

  const addEmployee = async () => {

    if (!fullName || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      const res = await fetch("http://localhost:5000/admin/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await res.json();
      alert(data.message || "Employee added!");

      setFullName("");
      setEmail("");
      setPassword("");
      setShowForm(false);

      fetchEmployees();

    } catch (error) {
      console.log(error);
      alert("Error adding employee");
    }

  };

  /* ===============================
     DELETE EMPLOYEE
  ================================= */

  const deleteEmployee = async (id) => {

    if (!window.confirm("Remove this employee?")) return;

    try {

      await fetch(`http://localhost:5000/admin/delete-employee/${id}`, {
        method: "DELETE"
      });

      fetchEmployees();

    } catch (error) {
      console.log(error);
    }

  };

  /* ===============================
     RENDER
  ================================= */

  return (

    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Employees</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Employee"}
        </button>
      </div>

      {/* ---- ADD EMPLOYEE FORM ---- */}

      {showForm && (
        <div className="card p-3 mb-4 shadow-sm">
          <h5 className="mb-3">Add New Employee</h5>
          <input
            className="form-control mb-2"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="form-control mb-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="form-control mb-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-success" onClick={addEmployee}>
            Save Employee
          </button>
        </div>
      )}

      {/* ---- EMPLOYEE TABLE ---- */}

      {employees.length === 0 ? (
        <div className="alert alert-info">No employees found.</div>
      ) : (

        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => (
              <tr key={emp._id}>
                <td>{index + 1}</td>
                <td>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>
                  <span className="badge bg-success">{emp.role}</span>
                </td>
                <td>
                  {emp.createdAt
                    ? new Date(emp.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteEmployee(emp._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      )}

    </div>

  );

}