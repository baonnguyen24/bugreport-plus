package com.bugreportplus.backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bugreportplus.backend.models.User;
import com.bugreportplus.backend.repositories.UserRepository;
import com.bugreportplus.backend.services.UserService;

@RestController
@RequestMapping("/api/v1/users")
public class UserManagementController {

    private final UserService userService;

    // Constructor
    public UserManagementController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/v1/users/register
     * 
     * Allow a new user to register with the system.
     * New user is assigned the default role of REPORTER
     * 
     * @param user object containing email and password from the request body
     * @return 201 CREATED with the registered user, or 409 CONFLICT if email exists
     */
    public ResponseEntity<?> regiterUser(@RequestBody User user) {
        // 1. Basic validation: Ensure required fields are present
        if(user.getEmail() == null || user.getPassword() == null || user.getEmail().trim().isEmpty() || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // 2. Check if user already exist -> return 409 CONFLICT
        if(userService.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User with this email alreadt exists.");
        }

        // 3. Register the user
        try {
            User registeredUser = userService.registerNewUser(user);

             // 4. Return 201 created
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (Exception e) {
            // 5. Handle unexpected server errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occured.");
        }
    }
}
