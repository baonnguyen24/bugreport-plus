package com.bugreportplus.backend.controllers;

import org.springframework.web.bind.annotation.RestController;

import com.bugreportplus.backend.models.*;
import com.bugreportplus.backend.services.*;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("api/v1/bugs/{bugId}/comments")
public class CommentController {
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * GET /api/v1/bugs/{bugId}/comments
     * Retrieve all comments of a given bug
     */
    @GetMapping
    public ResponseEntity<List<Comment>> getCommentsForBug(@PathVariable Long bugId) {
        List<Comment> comments = commentService.getCommentByBugId(bugId);
        return ResponseEntity.ok(comments);
    }

    /**
     * POST /api/v1/bugs/{bugId}/comments
     * Create a new comment for a specific bug
     */
    @PostMapping
    public ResponseEntity<?> addCommentsToBug(@PathVariable Long bugId, @RequestBody Map<String, String> requestBody, @AuthenticationPrincipal User user) {
        
        String content = requestBody.get("content");

        if(content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Comment cannot be empty.");
        }

        try {
            Comment newComment = commentService.createComment(bugId, user.getId(), content);
            return new ResponseEntity<>(newComment, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
               return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexepected error occured.");
        }
    }
}
