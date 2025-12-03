package com.bugreportplus.backend.services;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bugreportplus.backend.models.Bug;
import com.bugreportplus.backend.models.User;
import com.bugreportplus.backend.repositories.BugRepository;


@Service
public class BugService {

    private final BugRepository bugRepository;
    private final UserService userService;

    // Constructor
    public BugService(BugRepository bugRepository, UserService userService) {
        this.bugRepository = bugRepository;
        this.userService = userService;
    }

    // Create new Bug report
    @Transactional
    public Bug createBug(Bug bug, long reporterId) {
        User reporter = userService.findById(reporterId);
        
        if(reporter == null) {
            throw new RuntimeException("Reporter not found");
        }

        bug.setReporter(reporter);
        bug.setStatus(Bug.Status.OPEN);
        
        if(bug.getAssignedUser() ==  null) {
            bug.setAssignedUser(null);
        }

        return bugRepository.save(bug);
    }

    // Retrieve all bug reports
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'QA')")
    public List<Bug> findAllBugs() {
        return bugRepository.findAll();
    }

    // Retrieve a single bug by Id
    @Transactional(readOnly = true)
    public Optional<Bug> findBugById(long bugId) {
        return bugRepository.findById(bugId);
    }

    // Update Bug's details
    @Transactional
    public Optional<Bug> updateBugDetails(long bugId, Bug updatedBug) {
        return bugRepository.findById(bugId).map(bug -> {
            bug.setTitle(updatedBug.getTitle());
            bug.setDescription(updatedBug.getDescription());
            bug.setPriority(updatedBug.getPriority());
            bug.setUpdatedAt(updatedBug.getUpdatedAt());
            return bugRepository.save(bug);
        });
    }

    // Assign bug to a user
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'QA')")
    public Optional<Bug> assignBug(long bugId, long assignedUserId) {
        User assignedUser = userService.findById(assignedUserId);

        if(assignedUser == null) {
            throw new RuntimeException("Cannot find user");
        }

        return bugRepository.findById(bugId).map(bug -> {
            bug.setAssignedUser(assignedUser);
            bug.setUpdatedAt(Instant.now());
            
            return bugRepository.save(bug);
        });
    }

    // Update status of Bug Report
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'QA')")
    public Optional<Bug> updateBugStatus(long bugId, Bug.Status newStatus) {
        return bugRepository.findById(bugId).map(bug -> {
            bug.setStatus(newStatus);
            bug.setUpdatedAt(Instant.now());
            
            return bugRepository.save(bug);
        });
    }

    // Filter bug report by user
    @Transactional(readOnly = true)
    public List<Bug> findBugReportedByUser(long userId) {
        User user = userService.findById(userId);

        if(user == null) {
            return List.of();
        }

        return bugRepository.findByReporter(user);
    }
    
}
