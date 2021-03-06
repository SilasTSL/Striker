import './DailyTasklist.css';
import { useState, useEffect } from "react"
import { ContainerDaily } from '../../components/Tasklists/DailyTasklist/ContainerDaily';
import StrikerLayout from '../StrikerLayout/StrikerLayout';
import { useUserAuth } from "../../context/UserAuthContext";

//getTasklist API: https://striker-backend.herokuapp.com/task-list/dVxGQxT8uKepfQLJxqnhBRWx6Dz1?date=2022-06-12

function DailyTasklist() {

  //Today's date:
  let today = new Date();
  //const dateString = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');
  const dateString = "2022-06-12";
  console.log("Loading data for date: " + dateString);
  
  //Get User Data:
  let user = JSON.parse(localStorage.getItem("currentUser"));
  console.log("User:");
  console.log(user);
  const userId = user.uid;

  //State for Task list
  const [tasks, setTasks] = useState([]);

  //Initial update of tasks
  useEffect(() => {
    console.log("Data: ");
    fetch(`https://striker-backend.herokuapp.com/task-list/${userId}?date=${dateString}`)
    .then((response) => response.json())
    .then((data) => data.filter((task) => !task.deadline.Valid))
    .then((dailyData) => dailyData.map((task) => {
      return {id: task.id, type: task.taskType, text: task.description, priority: task.priority.Int64, effort: task.effort.Int64, striked: task.isCompleted.Valid};
    }))
    .then((log) => {
      console.log(log);
      return log;
    })
    .then((filteredData) => setTasks(filteredData));
  }, []);

  // State for filters, first value is if filter is clicked, second is up or down
  const [filters, setFilters] = useState([
    [0, 1], [0, 1]
  ]);

  //State for Number of Added Tasks
  const [addedTasks, setAddedTasks] = useState([0]);

  //Strike Task Event
  const strikeTask = (id) => {
    setTasks(tasks.map((task) => task.id == id ? {id: task.id, type: task.type, text: task.text, priority: task.priority, effort: task.effort, striked: !task.striked} : task))
  }

  //Delete Task Event
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  //Add Task Event
  const addTask = () => {
    const newTask = {id: tasks.length + 1, type: 0, text: "", priority: 0, effort: 0, striked: false};
    setTasks([...tasks, newTask]);

    const newAddedTasks = addedTasks[0] + 1;
    setAddedTasks([newAddedTasks]);
  }
  //Callback for Add Task Event
  useEffect(() => {
    if (addedTasks[0] > 0) {
      const newTaskElement = document.getElementsByClassName("task")[document.getElementsByClassName("task").length - 1];
      const newDivPosition = newTaskElement.offsetTop;
      document.getElementsByClassName("tableContainer")[0].scrollTop = newDivPosition;
    }
  }, [addedTasks])

  //Change Task Type Event
  const changeTaskType = (id, e) => {
    e.preventDefault();
    if (e.keyCode == 40) {
      setTasks(tasks.map((task) => task.id == id ? {id: task.id, type: task.type + 1 <= 2 ? task.type + 1 : 0, text: task.text, priority: task.priority, effort: task.effort, striked: task.striked} : task))
    } else if (e.keyCode == 38) {
      setTasks(tasks.map((task) => task.id == id ? {id: task.id, type: task.type - 1 >= 0 ? task.type - 1 : 2, text: task.text, priority: task.priority, effort: task.effort, striked: task.striked} : task))
    } else {
      alert("Use the up or down arrows to swap through task types!");
    }
  }

  //Change Task Text Event
  const updateTaskTextState = (id) => {
    const targetText = document.getElementsByClassName(id + "text")[0];
    const updatedText = targetText.textContent;
    setTasks(tasks.map((task) => task.id == id ? {id: task.id, type: task.type, text: updatedText, priority: task.priority, effort: task.effort, striked: task.striked} : task))
  }

  //Change Task Priority Event
  const changeTaskPriority = (id, e) => {
    e.preventDefault();
    if (e.keyCode == 40) {
      setTasks(tasks.map((task) => task.id == id ? {id: task.id, type: task.type, text: task.text, priority: task.priority + 1 <= 2 ? task.priority + 1 : 0, effort: task.effort, striked: task.striked} : task))
    } else if (e.keyCode == 38) {
      setTasks(tasks.map((task) => task.id == id ? {id: task.id, type: task.type, text: task.text, priority: task.priority - 1 >= 0 ? task.priority - 1 : 2, effort: task.effort, striked: task.striked} : task))
    } else {
      alert("Use the up or down arrows to swap through task priorities!");
    }
  }

  //Change Task Effort Event
  const updateTaskEffortState = (id) => {
    const targetEffort = document.getElementsByClassName(id + "effort")[0];
    const updatedEffort = parseInt(targetEffort.textContent);
    console.log("Updated Effort:");
    console.log(updatedEffort);
    setTasks(tasks.map((task) => task.id == id ? {id: task.id, type: task.type, text: task.text, priority: task.priority, effort: updatedEffort ? updatedEffort : 0, striked: task.striked} : task))
  }

  //Filter Priority Event
  const filterPriority = () => {
    let newTasks = [...tasks];
    newTasks.sort((a, b) => {
      if (a.priority < b.priority) {
        return 1 * filters[0][1];
      }
      if (a.priority > b.priority) {
        return -1 * filters[0][1];
      }
      return 0;
    })
    setTasks(newTasks);
    setFilters([[1, filters[0][1] * -1], [0, 1]]);
  }

  //Filter Effort Event
  const filterEffort = () => {
    let newTasks = [...tasks];
    newTasks.sort((a, b) => {
      if (a.effort < b.effort) {
        return -1 * filters[1][1];
      }
      if (a.effort > b.effort) {
        return 1 * filters[1][1];
      }
      return 0;
    })
    setTasks(newTasks);
    setFilters([[0, 1], [1, filters[1][1] * -1]]);
  }
  
  return (
    <StrikerLayout>
      <ContainerDaily tasks={tasks} strikeTask={strikeTask} deleteTask={deleteTask} addTask={addTask}
      filterPriority={filterPriority} filterEffort={filterEffort} filters={filters}
      updateTaskText={updateTaskTextState} updateTaskEffort={updateTaskEffortState} changeTaskType={changeTaskType} changeTaskPriority={changeTaskPriority}/>
    </StrikerLayout>
  );
}

export default DailyTasklist;
