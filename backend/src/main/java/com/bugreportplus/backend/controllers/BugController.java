package com.bugreportplus.backend.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.bugreportplus.backend.models.Bug;
import com.bugreportplus.backend.models.User;
import com.bugreportplus.backend.services.BugService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/api/v1/bugs")
public class BugController {
    
    private final BugService bugService;
    
    // Constructor
    public BugController(BugService bugService) {
        this.bugService = bugService;
    }

    /**
     *  POST /api/v1/bugs
     *  Creates a new bug report. Reporter is set to the currently authenticated user
     */
    @PostMapping
    public ResponseEntity<Bug> createBug(@RequestBody Bug bug, @AuthenticationPrincipal User user) {
        Bug createdBug = bugService.createBug(bug, user.getId());
        return new ResponseEntity<>(createdBug, HttpStatus.CREATED);
    }

    /**
     * GET /api/v1/bugs
     * Retrieve all bug reports. Requires QA or ADMIN role
     */
    @GetMapping
    public ResponseEntity<List<Bug>> getAllBugs() {
        List<Bug> bugs = bugService.findAllBugs();
        return ResponseEntity.ok(bugs);
    }

    /**
     * PUT /api/v1/bugs/{id}
     * Update the main details of bug
     */
    @PutMapping("/{id}")
    public ResponseEntity<Bug> updateBugDetails(@PathVariable Long id, @RequestBody Bug updatedBug) {
        return bugService.updateBugDetails(id, updatedBug)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PATCH /api/v1/bugs/{id}/assign
     * Assigns a bug to a new user. Requires QA or ADMIN role
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Bug> assignBug(@PathVariable Long id, @RequestBody Map<String, Long> requestBody) {
        Long assignedUserId = requestBody.get("userId");
        if(assignedUserId == null) {
            return ResponseEntity.badRequest().build();
        }

        return bugService.assignBug(id, assignedUserId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PATCH /api/v1/bugs/{id}/status
     * Updates the status of a bug (e.g OPEN, RESOLVED). Requires QA or ADMIN role
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Bug> updateBugStatus(@PathVariable Long id, @RequestBody Map<String, String> requestBody) {
        String statusStr = requestBody.get("status");
        if(statusStr == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Bug.Status newStatus = Bug.Status.valueOf(statusStr.toUpperCase());
            return bugService.updateBugStatus(id, newStatus)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
