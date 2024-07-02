import React,  { useEffect, useState}  from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaSearch } from "react-icons/fa";

// import assets
import '../../assets/css/Project.css';

// import service
import fetchUserData, { fetchMembers } from "../../services/homeService";
import { searchPersonnel } from "../../services/accountService";
import { createProject } from "../../services/projectService";
import { searchProject } from "../../services/projectService";
import { deleteProject } from "../../services/projectService";
import { updateProject } from "../../services/projectService";

const Project = () => {

    const [ userData, setUserData ] = useState(null);
    const [ error, setError ] = useState('');
    const navigate = useNavigate();

    const [ id , setId ] = useState('');
    const [ name, setName ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ members, setMembers ] = useState([]);
    const [ startDate, setStartDate ] = useState('');
    const [ endDate, setEndDate ] = useState('');


    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // For searching project
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState('');
    const [allProjects, setAllProjects] = useState([]);
    const [showSearchResult, setShowSearchResult] = useState(false);

    // For editing project
    const [ showEdit, setShowEdit ] = useState(false);
    const [ allMembers, setAllMembers ] = useState([]);

    
    useEffect(() => {
        const getUserData = async () => {
            const token = localStorage.getItem('token');
            
            if(!token){ // if token isn't there, go back to login
                navigate('/login');
                return;
            }

            try{
                const data = await fetchUserData(token);

                // state initiate with the user data achieved
                setUserData(data);

                const allProjetcs = await searchProject(token, '');
                setAllProjects(allProjetcs);

                const allMembers = await searchPersonnel(token, '');
                setAllMembers(allMembers);
            }
            
            catch (error) {
 
                setError(error.message);
                if (error.message === 'Unauthorized. Please log in again.') {
                    navigate('/login');
                }
            }
        };
        getUserData();

    },[navigate]);

    if (error) return <div className="mt-3 text-danger errMess">mivrin   Error: {error}</div>;
    if (!userData) return <div className="mt-3 text-danger errMess">No user data available</div>;


    const handleLogout = () => {
        localStorage.removeItem('token');
        setTimeout(() => {
            navigate('/login');
        }, 2000);
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('endDate', endDate);
        

        const token = localStorage.getItem('token');

        try {

            const response = await createProject(token, formData);
            if (response.status === 200) {
                setErrorMessage('');
                setSuccessMessage('Project created successfully');
                setTimeout(() => {
                    setName('');
                    setDescription('');
                    setEndDate('');
                }, 2000);
            }
            else {
                setSuccessMessage('');
                setErrorMessage('failed to create project');
            }
            const allProjetcs = await searchProject(token, '');
            setAllProjects(allProjetcs);
            setSearchTerm('')
            setSearchResults('');
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
            setSuccessMessage('');
        };


    };

    const HandlesearchProject = async (event) => {
        if(event.key === 'Enter' || event.type === 'click') {
            event.preventDefault();
            
            try {
                const token = localStorage.getItem('token');
                const results = await searchProject(token, searchTerm);
                setSearchResults(results);
                setShowSearchResult(false);
            }
            catch (error) {
                setErrorMessage('Error searching Project: ', error);
            };
        }
        else{
            try {
                const token = localStorage.getItem('token');
                const results = await searchProject(token, searchTerm);
                setSearchResults(results);
                setShowSearchResult(true);
            }
            catch (error) {
                setErrorMessage('Error searching project: ', error);
            };
        }
    };

    const handleDeleteProject = async (projectId) => {
        const token = localStorage.getItem('token');
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await deleteProject(token, projectId);
            setSuccessMessage('Project deleted successfully');

            const updatedProject = await searchProject(token, searchTerm);
            setAllProjects(updatedProject);
            setSearchResults('');
            setSearchTerm('');

        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to delete Project');
            setSuccessMessage('');
        }
        
    };

    const handleEditProject = async (event, projectId) => {
        event.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('members', JSON.stringify(members.map(member => member._id)));
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);

        const token = localStorage.getItem('token');

        try {
            await updateProject(token, formData, projectId);
            setSuccessMessage('Update successful');
            setErrorMessage('');

            const allProjetcs = await searchProject(token, '');
            setAllProjects(allProjetcs);
            setSearchTerm('')
            setSearchResults('');
        }
        catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to update project');
            setSuccessMessage('');
        }

    }

    const handleProjectClick = (project) => {
        setShowEdit(true);
        setId(project._id)
        setName(project.name);
        setDescription(project.description);
        setStartDate(new Date(project.startDate).toISOString().slice(0, 10));
        setEndDate(new Date(project.endDate).toISOString().slice(0, 10));

        fetchMembersDetails(project.members);

    }

    const fetchMembersDetails = async (membersId) => {
        try {
            const token = localStorage.getItem('token');
            const data = await fetchMembers(token, membersId);
            setMembers(data);

        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
            setSuccessMessage('');
        };
    }
    
    const handleAddProject = () => {
        setShowEdit(false);
        setName('');
        setDescription('');
        setEndDate('');
    }

    const addMember = (memberToAdd) => {
        if (!members.find(member => member._id === memberToAdd._id)) {
            setMembers([...members, memberToAdd]);
        }
    };

    const removeMember = (memberIdToRemove) => {
        const updatedMembers = members.filter(member => member._id !== memberIdToRemove);
        setMembers(updatedMembers);
    }

    return (
        <div className="ProjectPage">
            <div className="container">

                <Navbar className="" expand="lg">
                    <Container>    
                        <Navbar.Brand href="/home">E-Commune</Navbar.Brand>
                        
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />                    
                        
                        <Navbar.Collapse id="basic-navbar-nav">
                                
                            <Nav className="me-auto">
                                {userData.isAdmin && (
                                    <Nav.Link href="/project" className="text-dark">Project</Nav.Link>
                                    )}
                                {userData.isAdmin && (
                                    <Nav.Link href="/task" className="text-dark">Tasks</Nav.Link>
                                    )}
                                <Nav.Link href="/account" className="text-dark">Account</Nav.Link>
                            </Nav>
                            <Nav>
                                <Nav.Link onClick={handleLogout} className="text-dark">Logout</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>

                    </Container>
                </Navbar>
                <div className="container-fluid d-flex ps-0 justify-content-center align-items-center">
                    <div className={`container-fluid d-flex justify-content-center align-items-center ${showEdit ? 'hideItems' : ''} NewProject`}>
                        <div className="formDiv">
                            <h1 className="display-6 fw-bold mb-4 mt-2 text-center">New Project</h1>
                            {errorMessage && <p className="mt-3 text-danger errMess">{errorMessage}</p>}
                            {successMessage && <p className="mt-3 text-success succMess">{successMessage}</p>}
                            <form onSubmit={handleCreateProject} className="p-4 p-md-5 border rounded-3 bg-light">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input type="text" className="form-control" value={name}  onChange={(e) => setName(e.target.value)} required/>
                                            <label htmlFor="name">Name</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input type="text" className="form-control" value={description}  onChange={(e) => setDescription(e.target.value)}/>
                                            <label htmlFor="name">Description</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3">
                                            <input type="date" className="form-control" value={endDate}  onChange={(e) => setEndDate(e.target.value)}/>
                                            <label htmlFor="endDate">End Date</label>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="w-100 btn btn-lg btn-primary">Save</button>
                           </form>
                        </div>
                    </div>

                    <div className={`container-fluid d-flex justify-content-center align-items-center ${showEdit ? '' : 'hideItems'} EditProject`}>
                            <div className="formDiv">
                                <h1 className="display-6 fw-bold mb-4 mt-2 text-center">Edit Project</h1>
                                {errorMessage && <p className="mt-3 text-danger errMess">{errorMessage}</p>}
                                {successMessage && <p className="mt-3 text-success succMess">{successMessage}</p>}
                                <form onSubmit={(event) => handleEditProject(event, id)} className="p-4 p-md-5 border rounded-3 bg-light">
                                            <div className="mb-3">
                                                <label htmlFor="name">Name</label>
                                                <input type="text" className="form-control" value={name}  onChange={(e) => setName(e.target.value)} required/>
                                            </div>
                                            <div className="mb-3 input-container">
                                                <label htmlFor="name">Description</label>
                                                <textarea type="text" className="form-control" value={description}  onChange={(e) => setDescription(e.target.value)}/>
                                            </div>

                                            <div className="mb-3 row">
                                                <h3>Project members: </h3>
                                                <div className="Members col-md-6">
                                                    { members.map(member => (
                                                        <div key={member._id}>
                                                            {member.name}
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm ms-2"
                                                                onClick={() => removeMember(member._id)}>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="AllUsers col-md-6">
                                                    {allMembers.filter(member => !members.find(m => m._id === member._id)).map(member => (
                                                        <div key={member._id}>
                                                            {member.name} 
                                                            <button  
                                                                className="btn btn-outline-primary btn-sm ms-2"
                                                                onClick={() => addMember(member)}>
                                                                Add
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="name">startDate</label>
                                                <input type="date" className="form-control" value={startDate}  onChange={(e) => setStartDate(e.target.value)}/>
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="endDate">End Date</label>
                                                <input type="date" className="form-control" value={endDate}  onChange={(e) => setEndDate(e.target.value)}/>
                                            </div>
                                    <button type="submit" className="w-100 btn btn-lg btn-primary">Edit</button>
                               </form>
                        </div>
                    </div>

                    <div className="AllProject mt-3">
                        <div className={`${showEdit ? '' : 'hideItems'}`}>
                                    <button className="btn btn-outline-primary" onClick={() => handleAddProject()}>
                                        Add project
                                    </button>
                        </div>
                        <div className="p-4 mt-3 border rounder-3 bg-light ProjectList ">
                            <div className="sticky-top d-flex align-items-center justify-content-between input-container">
                                <input 
                                    type="text" 
                                    name="search_user" 
                                    className="search-input"
                                    placeholder="Search Project"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={HandlesearchProject}
                                />
                                <button className="search-button" onClick={ HandlesearchProject }>
                                    <FaSearch className="icon"/>
                                </button>
                            </div>
                            <div className="mt-3 list-group">
                                {searchTerm ? (
                                    searchResults.length === 0 ?
                                    (
                                        <strong className="text-gray-dark">No project found</strong>
                                    ) 
                                    :
                                    (
                                        showSearchResult ? (
                                            searchResults.map(project => (
                                                <div key={project._id} onClick={() => handleProjectClick(project)}>
                                                    <div className="list-group-item list-group-item-action user-list-item rounded-3">                                            
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div className="mb-1">
                                                                {project.name}
                                                            </div>                                            
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                        :
                                        (
                                            searchResults.map(project => (
                                                <div>
                                                    <div key={project._id} onClick={() => handleProjectClick(project)}>
                                                        <div className="list-group-item list-group-item-action user-list-item rounded-3">                                            
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div className="mb-1">
                                                                    {project.name}
                                                                </div>
                                                                <div>
                                                                    <button 
                                                                        className="btn btn-outline-danger"
                                                                        onClick={() => handleDeleteProject(project._id)}    
                                                                    >
                                                                    Delete
                                                                    </button>                                            
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                                                                        
                                        )
                                    )
                                    )
                                    :
                                    (
                                        allProjects.map(project => (
                                            <div>
                                                <div key={project._id} onClick={() => handleProjectClick(project)}>
                                                    <div className="list-group-item list-group-item-action user-list-item rounded-3">                                            
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div className="mb-1">
                                                                {project.name}
                                                            </div>
                                                            <div>
                                                                <button 
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => handleDeleteProject(project._id)}    
                                                                >
                                                                Delete
                                                                </button>                                            
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )

                                }
                            </div>
                        </div>          
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Project;