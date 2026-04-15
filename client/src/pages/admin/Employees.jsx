import React from 'react'
import {useState} from 'react'
import {createRoot} from 'react'
import {useNavigate} from 'react-router-dom'
import AddE from './AddE'
import EmployeeTable from './EmployeeTable'

function Employees(list) {


    return (
        <div>
            <AddE />
            <EmployeeTable list={list}/>
        </div>
    )
}

export default Employees;