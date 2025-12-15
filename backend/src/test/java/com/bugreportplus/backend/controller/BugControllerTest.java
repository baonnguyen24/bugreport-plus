package com.bugreportplus.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.bugreportplus.backend.models.Bug;
import com.bugreportplus.backend.models.Bug.*;
import com.bugreportplus.backend.models.User;
import com.bugreportplus.backend.models.User.Role;
import com.bugreportplus.backend.repositories.BugRepository;
import com.bugreportplus.backend.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class BugControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BugRepository bugRepository;

    // IDs for pre-saved data
    private Long qaUserId;
    private Long devUserId;
    private Long openBugId;

    @BeforeEach
    void setUp() {
        // Clear repositories
        bugRepository.deleteAll();
        userRepository.deleteAll();
        
        // 1. Setup QA User (the reporter/authenticated user for most tests)
        User qaUser = new User();
        qaUser.setEmail("qa@example.com");
        qaUser.setPassword("hashedPassword"); 
        qaUser.setRole(Role.QA);
        qaUser.setFullName("QA Tester");
        qaUser = userRepository.save(qaUser);
        qaUserId = qaUser.getId();

        // 2. Setup Dev User (for assignment tests)
        User devUser = new User();
        devUser.setEmail("dev@example.com");
        devUser.setPassword("hashedPassword"); 
        devUser.setRole(Role.USER);
        devUser.setFullName("Developer");
        devUser = userRepository.save(devUser);
        devUserId = devUser.getId();

        // 3. Setup a pre-existing OPEN Bug
        Bug openBug = new Bug();
        openBug.setTitle("Pre-existing Bug");
        openBug.setDescription("A bug opened before the test run.");
        openBug.setReporter(qaUser);
        openBug.setStatus(Status.OPEN);
        openBug.setPriority(Priority.MEDIUM);
        openBug = bugRepository.save(openBug);
        openBugId = openBug.getId();
    }

    /**
     * Test case for POST /api/v1/bugs
     * Should successfully report a new bug when all data is valid.
     */


    /**
     * Test case for GET /api/v1/bugs/{id}
     * Should successfully retrieve a bug by ID.
     */


    /**
     * Test case for GET /api/v1/bugs
     * Should successfully retrieve all bugs in the database.
     */


    /**
     * Test case for PUT /api/v1/bugs/{id}/status
     * Should successfully update the bug status.
     */


    /**
     * Test case for PUT /api/v1/bugs/{id}/assign
     * Should successfully assign the bug to a specified user.
     */


    /**
     * Test case for POST /api/v1/bugs
     * Should return 400 Bad Request if a required field (title) is missing.
     */

    /**
     * Test case for unauthenticated access.
     * Should return 401 Unauthorized for attempting to create a bug.
     */
}
