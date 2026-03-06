import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const { isAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleRegister = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/register",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(res.data.message);
      navigateTo(`/otp-verification/${data.email}`);
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <>
      <div>
        <form
          className="auth-form"
          onSubmit={handleSubmit((data) => handleRegister(data))}
        >
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Name"
            required
            {...register("name")}
          />
          <input
            type="email"
            placeholder="Email"
            required
            {...register("email")}
          />
          <input
            type="password"
            placeholder="Password"
            required
            {...register("password")}
          />
          <button type="submit">Register</button>
        </form>
      </div>
    </>
  );
};

export default Register;
