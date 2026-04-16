
```
sms
├─ sms
│  ├─ .mvn
│  │  └─ wrapper
│  │     └─ maven-wrapper.properties
│  ├─ HELP.md
│  ├─ mvnw
│  ├─ mvnw.cmd
│  ├─ pom.xml
│  ├─ src
│  │  ├─ main
│  │  │  ├─ java
│  │  │  │  └─ com
│  │  │  │     └─ example
│  │  │  │        └─ sms
│  │  │  │           ├─ controller
│  │  │  │           │  ├─ AuthController.java
│  │  │  │           │  ├─ ErpController.java
│  │  │  │           │  └─ StudentController.java
│  │  │  │           ├─ dto
│  │  │  │           │  ├─ ApiResponse.java
│  │  │  │           │  └─ ChangePasswordRequest.java
│  │  │  │           ├─ entity
│  │  │  │           │  ├─ Attendance.java
│  │  │  │           │  ├─ Course.java
│  │  │  │           │  ├─ Enrollment.java
│  │  │  │           │  ├─ Faculty.java
│  │  │  │           │  ├─ Marks.java
│  │  │  │           │  ├─ Role.java
│  │  │  │           │  ├─ Staff.java
│  │  │  │           │  ├─ Student.java
│  │  │  │           │  └─ User.java
│  │  │  │           ├─ exception
│  │  │  │           │  ├─ GlobalExceptionHandler.java
│  │  │  │           │  └─ ResourceNotFoundException.java
│  │  │  │           ├─ repository
│  │  │  │           │  ├─ AttendanceRepository.java
│  │  │  │           │  ├─ CourseRepository.java
│  │  │  │           │  ├─ EnrollmentRepository.java
│  │  │  │           │  ├─ FacultyRepository.java
│  │  │  │           │  ├─ MarksRepository.java
│  │  │  │           │  ├─ StaffRepository.java
│  │  │  │           │  ├─ StudentRepository.java
│  │  │  │           │  └─ UserRepository.java
│  │  │  │           ├─ security
│  │  │  │           │  ├─ CustomUserDetailsService.java
│  │  │  │           │  ├─ JwtFilter.java
│  │  │  │           │  ├─ JwtUtil.java
│  │  │  │           │  └─ SecurityConfig.java
│  │  │  │           ├─ service
│  │  │  │           │  ├─ AttendanceService.java
│  │  │  │           │  ├─ CourseService.java
│  │  │  │           │  ├─ EnrollmentService.java
│  │  │  │           │  ├─ FacultyService.java
│  │  │  │           │  ├─ MarksService.java
│  │  │  │           │  └─ StudentService.java
│  │  │  │           └─ SmsApplication.java
│  │  │  └─ resources
│  │  │     ├─ application.properties
│  │  │     ├─ static
│  │  │     └─ templates
│  │  └─ test
│  │     └─ java
│  │        └─ com
│  │           └─ example
│  │              └─ sms
│  │                 └─ SmsApplicationTests.java
│  └─ target
│     ├─ classes
│     │  ├─ application.properties
│     │  └─ com
│     │     └─ example
│     │        └─ sms
│     │           ├─ controller
│     │           │  ├─ AuthController.class
│     │           │  ├─ ErpController.class
│     │           │  └─ StudentController.class
│     │           ├─ dto
│     │           │  ├─ ApiResponse.class
│     │           │  └─ ChangePasswordRequest.class
│     │           ├─ entity
│     │           │  ├─ Attendance.class
│     │           │  ├─ Course.class
│     │           │  ├─ Enrollment.class
│     │           │  ├─ Faculty.class
│     │           │  ├─ Marks.class
│     │           │  ├─ Role.class
│     │           │  ├─ Staff.class
│     │           │  ├─ Student.class
│     │           │  └─ User.class
│     │           ├─ exception
│     │           │  ├─ GlobalExceptionHandler.class
│     │           │  └─ ResourceNotFoundException.class
│     │           ├─ repository
│     │           │  ├─ AttendanceRepository.class
│     │           │  ├─ CourseRepository.class
│     │           │  ├─ EnrollmentRepository.class
│     │           │  ├─ FacultyRepository.class
│     │           │  ├─ MarksRepository.class
│     │           │  ├─ StaffRepository.class
│     │           │  ├─ StudentRepository.class
│     │           │  └─ UserRepository.class
│     │           ├─ security
│     │           │  ├─ CustomUserDetailsService.class
│     │           │  ├─ JwtFilter.class
│     │           │  ├─ JwtUtil.class
│     │           │  └─ SecurityConfig.class
│     │           ├─ service
│     │           │  ├─ AttendanceService.class
│     │           │  ├─ CourseService.class
│     │           │  ├─ EnrollmentService.class
│     │           │  ├─ FacultyService.class
│     │           │  ├─ MarksService.class
│     │           │  └─ StudentService.class
│     │           └─ SmsApplication.class
│     ├─ generated-sources
│     │  └─ annotations
│     ├─ generated-test-sources
│     │  └─ test-annotations
│     ├─ maven-status
│     │  └─ maven-compiler-plugin
│     │     ├─ compile
│     │     │  └─ default-compile
│     │     │     ├─ createdFiles.lst
│     │     │     └─ inputFiles.lst
│     │     └─ testCompile
│     │        └─ default-testCompile
│     │           ├─ createdFiles.lst
│     │           └─ inputFiles.lst
│     └─ test-classes
│        └─ com
│           └─ example
│              └─ sms
│                 └─ SmsApplicationTests.class
└─ sms-frontend
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  ├─ favicon.ico
   │  ├─ index.html
   │  ├─ logo192.png
   │  ├─ logo512.png
   │  ├─ manifest.json
   │  └─ robots.txt
   ├─ README.md
   └─ src
      ├─ App.css
      ├─ App.js
      ├─ App.test.js
      ├─ components
      │  ├─ AddStudent.js
      │  ├─ AdminDashboard.js
      │  ├─ EditStudent.js
      │  ├─ FacultyDashboard.js
      │  ├─ ForgotPassword.js
      │  ├─ Login.js
      │  ├─ Register.js
      │  ├─ ResetPassword.js
      │  ├─ StudentList.js
      │  └─ StudentProfile.js
      ├─ index.css
      ├─ index.js
      ├─ logo.svg
      ├─ reportWebVitals.js
      └─ setupTests.js

```