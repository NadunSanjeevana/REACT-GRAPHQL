import "./App.css";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useState } from "react";

const GET_USERS = gql`
  query {
    getUsers {
      id
      name
      age
      isMarried
    }
  }
`;

const GET_USER_BY_ID = gql`
  query getUserById($id: ID!) {
    getUserById(id: $id) {
      id
      name
      age
      isMarried
    }
  }
`;

const CREATE_USER = gql`
  mutation createUser($name: String!, $age: Int!, $isMarried: Boolean!) {
    createUser(name: $name, age: $age, isMarried: $isMarried) {
      id
      name
      age
      isMarried
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_USERS);
  const [userId, setUserId] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    age: "",
    isMarried: false,
  });

  const {
    loading: loadingUser,
    error: errorUser,
    data: dataUser,
    refetch,
  } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId, // Prevent query execution if userId is empty
  });

  const [createUser] = useMutation(CREATE_USER, {
    update(cache, { data: { createUser } }) {
      cache.modify({
        fields: {
          getUsers(existingUsers = []) {
            return [...existingUsers, createUser];
          },
        },
      });
    },
    onCompleted: () => {
      setNewUser({ name: "", age: "", isMarried: false }); // Reset form after user creation
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <h1>Users</h1>
      <div>
        {data.getUsers.map((user) => (
          <div key={user.id}>
            <p>Name: {user.name}</p>
            <p>Age: {user.age}</p>
            <p>Married: {user.isMarried ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>

      <h2>User by ID</h2>
      <input
        type="text"
        placeholder="Enter ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={() => refetch({ id: userId })}>Get User</button>

      {loadingUser && <p>Loading user...</p>}
      {errorUser && <p>Error: {errorUser.message}</p>}

      {dataUser?.getUserById && (
        <div>
          <p>Name: {dataUser.getUserById.name}</p>
          <p>Age: {dataUser.getUserById.age}</p>
          <p>Married: {dataUser.getUserById.isMarried ? "Yes" : "No"}</p>
        </div>
      )}

      <h2>Create User</h2>
      <input
        type="text"
        placeholder="Name"
        value={newUser.name}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Age"
        value={newUser.age}
        onChange={(e) =>
          setNewUser({ ...newUser, age: parseInt(e.target.value) })
        }
      />
      <label>
        <input
          type="checkbox"
          checked={newUser.isMarried}
          onChange={(e) =>
            setNewUser({ ...newUser, isMarried: e.target.checked })
          }
        />
        Married
      </label>
      <button
        onClick={() =>
          createUser({
            variables: {
              name: newUser.name,
              age: newUser.age,
              isMarried: newUser.isMarried,
            },
          })
        }
      >
        Create User
      </button>
    </>
  );
}

export default App;
