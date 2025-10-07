const courseEndpoint = "http://localhost/student_enrollment_system/php/course.php";

function displayCourses() {
  const courseTable = document.querySelector("#table_body_course");

  fetch(courseEndpoint)
  .then((response) => response.json())
  .then((courseList)=> {
    courseTable.innerHTML = ""

    for(const course of courseList) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.course_code}</td>
        <td>${course.course_title}</td>
        <td>${course.units}</td>
        <td>${course.lecture_hours}</td>
        <td>${course.lab_hours}</td>
        <td>${course.dept_id}</td>
        <td><button 
          type="button"
          onclick="editTable(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          onClick="deleteRow(this)">
            Delete
          </button>
        </td>
      `
      courseTable.append(row);
    }
  });
}

displayCourses()