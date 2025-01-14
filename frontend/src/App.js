import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import Account from "./components/Account/Account";
import Project from "./components/Project/Project";
import Task from "./components/Task/Task";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={ <Navigate to="/Login"/>} />
    
        <Route path="/register" Component={Register}/>
        <Route path="/login" Component={Login}/>
        <Route path="/home" Component={Home}/>
        <Route path="/account" Component={Account}/>
        <Route path="/project" Component={Project}/>
        <Route path="/task" Component={Task}/>
      </Routes>
    </Router>
  );
}

export default App;
