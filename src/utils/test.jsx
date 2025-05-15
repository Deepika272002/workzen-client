import React, { useState } from "react";

const test = () => {
  const [email, setEmail] = useState("");
  const handlechange = (e) => {
    e.preventDefault();
    console.log(`email:: ${email}`);
  };

  return (
    <form onSubmit={handlechange}>
      <label>Name:</label>
      <input
        type="email"
        name="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">submit</button>
    </form>
  );
};

export default test;