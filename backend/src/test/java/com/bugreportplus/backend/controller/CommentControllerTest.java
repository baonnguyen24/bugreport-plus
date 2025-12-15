package com.bugreportplus.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.bugreportplus.backend.models.*;
import com.bugreportplus.backend.models.User.Role;
import com.bugreportplus.backend.repositories.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional // Ensure db is cleaned up after each test
public class CommentControllerTest {
    
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BugRepository bugRepository;

    @Autowired
    private CommentRepository commentRepository;

    // Mock Data Setup
    private Long testUserId;
    private Long testBugId;
    private Long preExistingCommentId;

    @BeforeEach
    void setUp() {
        // Clear all repo
        userRepository.deleteAll();
        bugRepository.deleteAll();
        commentRepository.deleteAll();

        // 1. Setup authenticated user
        User testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword("secureHash");
        testUser.setRole(Role.QA);
        testUser.setFullName("John Doe");
        
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();

        // 2. Setup bug
        Bug testBug = new Bug();
        testBug.setTitle("API Integration Test bug");
        testBug.setDescription("Test Description");
        testBug.setPriority(Bug.Priority.MEDIUM);
        testBug.setReporter(testUser);
        testBug.setStatus(Bug.Status.OPEN);

        testBug = bugRepository.save(testBug);
        testBugId = testBug.getId();

        // 3. Setup comment
        Comment preExistingComment = new Comment("Initial comment", testBug, testUser);
        preExistingComment = commentRepository.save(preExistingComment);
        preExistingCommentId = preExistingComment.getId();
    }
    
    /**
     * Test case for GET /api/v1/bugs/{bugId}/comments
     * Should successfully retrieve comments for a bug
     */
    @Test
    @WithMockUser(username = "test@example.com", roles = "QA")
    void getCommentsForBug() throws Exception {
        mockMvc.perform(get("/api/v1/bugs/{bugId}/comments", testBugId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(preExistingCommentId))
                .andExpect(jsonPath("$[0].content").value("Initial comment"))
                .andExpect(jsonPath("$[0].user.id").value(testUserId));
    }
    
    /**
     * Test case for POST /api/v1/bugs/{bugId}/comments
     * Should successfully create a new comments
     */
    @Test
    @WithMockUser(username = "test@example.com", roles = "QA")
    void addCommentToBug_OnSuccess() throws Exception {

        // Arrange
        String content = "This issue is critical and is confirmed via API Test";
        Map<String, String> requestBody = Map.of("content", content);

        // Act & Assert
        mockMvc.perform(post("/api/v1/bugs/{bugId}/comments", testBugId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("content"))
                .andExpect(jsonPath("$.bug.id").value(testBugId))
                .andExpect(jsonPath("$.user.id").value(testUserId));

        // Assert if there is another comment
        assertTrue(commentRepository.count() == 2);
    }

    /**
     * Test case for POST /api/v1/bugs/{bugId}/comments
     * Should return 400 Bad Request if comment content is empty
     */
    @Test
    @WithMockUser(username = "test@example.com", roles = "QA")
    void addEmptyCommentToBug_BadRequest() throws Exception {

        // Arrange
        Map<String, String> requestBody = Map.of("content", "");

        // Act & Assert
        mockMvc.perform(post("/api/v1/bugs/{bugId}/comments", testBugId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$").value("Comment cannot be empty."));
    }


    /**
     * Test case for POST /api/v1/bugs/{bugId}/comments
     * Should return 404 NOT FOUND if bug is invalid
     */
    @Test
    @WithMockUser(username = "test@example.com", roles = "QA")
    void invalidBug_NotFound() throws Exception {

        // Arrange
        String content = "This issue is critical and is confirmed via API Test";
        Map<String, String> requestBody = Map.of("content", content);

        Long nonExistedBugId = 1234L;

        // Act & Assert
        mockMvc.perform(post("/api/v1/bugs/{bugId}/comments", nonExistedBugId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isNotFound());
    }

    /**
     * Test case for unauthorized access
     * Should return 401 Unauthorized
     */
    @Test
    void addComment_UnauthorizedAccess() throws Exception {
        Map<String, String> requestBody = Map.of("content", "some contents");

        // Act & Assert
        mockMvc.perform(post("/api/v1/bugs/{bugId}/comments", testBugId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isUnauthorized());
    }
}
