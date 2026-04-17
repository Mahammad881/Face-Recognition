import React, { useEffect, useState } from "react";
import api from "../../utils/api";

function StudentList() {

  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const styles = {

    container:{
      padding:"40px",
      background:"#f4f6f8",
      minHeight:"100vh",
      fontFamily:"Arial"
    },

    card:{
      background:"#fff",
      padding:"25px",
      borderRadius:"10px",
      boxShadow:"0 4px 12px rgba(0,0,0,0.08)"
    },

    header:{
      display:"flex",
      justifyContent:"space-between",
      marginBottom:"20px"
    },

    input:{
      padding:"10px",
      border:"1px solid #ddd",
      borderRadius:"6px"
    },

    table:{
      width:"100%",
      borderCollapse:"collapse"
    },

    th:{
      background:"#4f46e5",
      color:"#fff",
      padding:"12px",
      textAlign:"left"
    },

    td:{
      padding:"12px",
      borderBottom:"1px solid #eee"
    }

  };

  const fetchStudents = async () => {
    try {

      const res = await api.get("/students");

      setStudents(res.data);
      setFiltered(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchStudents();

  }, []);

  useEffect(()=>{

    const result = students.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(result);

  },[search,students])

  if(loading) return <p>Loading students...</p>

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <div style={styles.header}>
          <h2>Students ({students.length})</h2>

          <input
            style={styles.input}
            placeholder="Search student..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
        </div>

        <table style={styles.table}>

          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Registered</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map(student=>(
              <tr key={student.student_id}>
                <td style={styles.td}>{student.student_id}</td>
                <td style={styles.td}>{student.name}</td>
                <td style={styles.td}>
                  {new Date(student.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default StudentList;