## Netflix

A simple Netflix clone made for the term project of Level-2 Term-2 of CSE 216 (Database Sessional) at Bangladesh University of Engineering and Technology.

## Demo Video: [Google Drive](https://drive.google.com/file/d/1CGdOV_rHBBWYqaAviNdVbvhW7HEs9sXx/view?usp=sharing)

## Features:
 1. Movie/TV show streaming
 2. Personalized recommendation based on your history
 3. Subscription management
 4. Flexible search options
 5. Simple & intuitive UI

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

1. Node.js
2. React.js
3. Oracle 11g


### Installing

A step by step series of examples that tell you how to get a development env running

1. Backend
```
 >> cd backend
 >> npm install
 >> npm start
```
2. Frontend
```
 >> cd frontend
 >> npm install
 >> npm start
```
3. Oracle 11g
 
 Type this in Oracle SQL PLUS
 ```
 >> CREATE USER NETFLIX IDENTIFIED BY 123;
 >> GRANT ALL PRIVILEGES TO NETFLIX;
```
 After that, run the DDL, PROCEDURES, TRIGGERS, FUNCTIONS file to set up the database tables and relevant functions.
 
 Also, if possible, import the data from [Table Backup](https://github.com/thr0m3l/netflix/tree/master/Table%20Backup)
 
 We used Navicat for connecting to Oracle, you're free to use anything else.


## Built With

* [Node.js](https://nodejs.org/en/) - Backend environment
* [Express](https://expressjs.com/) - Backend Server
* [React](https://reactjs.org/) - Frontend Library
* [Oracle 11g](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html) - Database


## Authors

* **Tanzim Hossain Romel** - [thr0m3l](https://github.com/thr0m3l)
* **Saadman Ahmed** - [stebaratheon](https://github.com/stebaratheon)

See also the list of [contributors](https://github.com/thr0m3l/netflix/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Our Project Supervisor:
  Dr. Muhammad Abdullah Adnan
  (Associate Professor, 
  Dept. of CSE,
  Bangladesh University of Engineering & Technology) 
  
* Stack Overflow
* Developers who built Node.js & React
