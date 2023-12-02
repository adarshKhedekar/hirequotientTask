import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";

function App() {
  const [adminData, setAdminData] = useState(null);
  const [selectedRow, setSelectedRow] = useState([]);
  const [currentIndex, setCurrentIndex] = useState([]);
  const [pages, setPages] = useState([]);
  const [toDispaly, setToDisplay] = useState([]);
  const [flag, setFlag] = useState(false)
  const dataPerpage = 10;

  useEffect(() => {
    async function getData() {
      const response = await fetch(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
      const data = await response.json();
      setAdminData(data);
      setToDisplay(data);
      const totalPages = Math.ceil(data.length / dataPerpage);

      // Create an array with page numbers from 1 to totalPages
      const pageArray = Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
      setPages(pageArray);
    }
    getData();
  }, []);

  //Deleting a single Row
  function handleDelete(e, id) {
    const updatedAdmins = adminData?.filter((data) => data.id !== id);
    setAdminData(updatedAdmins);
    const totalPages = Math.ceil(updatedAdmins?.length / dataPerpage);
    const pageArray = Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
    setPages(pageArray);
    toast.error('Deleted Successfully!')
  }

  //Editing a row
  function handleEdit(e, id) {
    const row = document.getElementById(id);
    const name = row.children[1];
    const email = row.children[2];
    const role = row.children[3];

    let length = row.childNodes[4].children.length;
    //handling adding the button only once
    if (length < 3) {
      //creating Button to save edited text
      const btn = document.createElement("div");
      btn.innerHTML = `<i class="ri-check-line"></i>`;
      btn.classList.add('save')
      row.children[4].appendChild(btn);

      btn.addEventListener("click", () => {
        name.contentEditable = false;
        email.contentEditable = false;
        role.contentEditable = false;
        name.style.backgroundColor = "transparent";
        email.style.backgroundColor = "transparent";
        role.style.backgroundColor = "transparent";
        toast.success('Edited Successfully!')
        //after editing removing the edit button
        btn.remove();
      });
    }

    //making contain editable
    name.contentEditable = true;
    email.contentEditable = true;
    role.contentEditable = true;
    name.style.backgroundColor = "#DFDFDE";
    email.style.backgroundColor = '#DFDFDE'
    role.style.backgroundColor = '#DFDFDE'
  }

  //saving selected rows for deletion
  function handleCheckboxChange(e, id) {
    if (e.target.checked) {
      setSelectedRow([...selectedRow, id]);
    } else {
      setSelectedRow(selectedRow?.filter((rowId) => rowId !== id));
    }
  }
  //handling multiple deletion
  function handleMultipleDelete() {
    const selector = document.getElementById("allSelection");
    selector.checked = false;
    console.log(selectedRow);
    const updatedAdmins = adminData?.filter((data) => {
      return !selectedRow.includes(data.id);
    });
    setAdminData(updatedAdmins);
    if(selectedRow.length > 0){
      toast.error('Deleted Successfully!')
    }

    // Clear selected rows after deletion
    setSelectedRow([]);
    const totalPages = Math.ceil(updatedAdmins?.length / dataPerpage);
    const pageArray = Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
    setPages(pageArray);
  }

  function handleSelect(e) {
    let limit = 10;
    let startIndex = currentIndex;
    let arr = [];
    if (e.target.checked) {
      adminData?.slice(startIndex).forEach((element) => {
        if (limit > 0) {
          arr.push(element.id);
        }
        limit--;
      });
      console.log(arr);
      setSelectedRow(arr);
    } else {
      setSelectedRow([]);
    }
  }

  const handlePageClick = (pageNumber) => {
    // Calculate the new index based on the clicked page number

    const newIndex = (pageNumber - 1) * dataPerpage;
    setCurrentIndex(newIndex);
  };

  function handleNext(){
    const selector = document.getElementById("allSelection");
    selector.checked = false;
    if(!flag){
      handlePageClick(2)
      setFlag(prevState => !prevState);
    }else{
      if (currentIndex + 10 <= adminData.length) {
        setCurrentIndex((prevIndex) => prevIndex + dataPerpage);
      }
    }
  };

  // Function to handle previous slide
  function handlePrev(){
    const selector = document.getElementById("allSelection");
    selector.checked = false;
    setCurrentIndex((prevIndex) =>
      prevIndex - dataPerpage < 0 ? 0 : prevIndex - dataPerpage
    );
  };
  function handleSearch(e) {
    setCurrentIndex(0);
    const input = e.target.value;
    const len = e.target.value.length;
    var matches;
    var totalPages;
    if (len === 0) {
      totalPages = Math.ceil(adminData?.length / dataPerpage);
      setAdminData(toDispaly);
    } else {
      const regex = new RegExp(input, "gi");

      matches = toDispaly?.filter((x) => {
        return (
          x.name.match(regex) || x.email.match(regex) || x.role.match(regex)
        );
      });
      setAdminData([...matches]);
      totalPages = Math.ceil(matches?.length / dataPerpage);
    }
    const pageArray = Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
    setPages(pageArray);
  }

  return (
    <div className="App">
      <div><Toaster/></div>
      <div className="nav">
      <input type="text" placeholder="search" onChange={handleSearch} />
      <div className="del-button" onClick={handleMultipleDelete}>
        <i class="ri-delete-bin-line"></i>
      </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelect}
                id="allSelection"
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        {adminData
          ?.slice(currentIndex, currentIndex + dataPerpage)
          .map((data, index) => {
            return (
              <tbody key={index}>
                <tr
                  id={data.id}
                  className={`${
                    selectedRow.includes(data.id) ? "checked" : ""
                  }`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRow.includes(data.id)}
                      onChange={(e) => handleCheckboxChange(e, data.id)}
                    />
                  </td>
                  <td>{data.name}</td>
                  <td>{data.email}</td>
                  <td>{data.role}</td>
                  <td className="actions">
                    <div onClick={(e) => handleEdit(e, data.id)} className="edit-btn">
                      <i class="ri-edit-box-line"></i>
                    </div>
                    <div onClick={(e) => handleDelete(e, data.id)} className="del-btn">
                      <i class="ri-delete-bin-line"></i>
                    </div>
                  </td>
                </tr>
              </tbody>
            );
          })}
      </table>
      <div className="footer">
        <button onClick={handlePrev}>&lt;&lt;</button>
        {pages?.map((page) => (
          <button key={page} onClick={() => handlePageClick(page)} className={`${Math.floor(currentIndex/10) === page - 1 ? 'current' : ''}`} >
            {page}
          </button>
        ))}
        <button onClick={handleNext}>&gt;&gt;</button>
      </div>
    </div>
  );
}

export default App;
