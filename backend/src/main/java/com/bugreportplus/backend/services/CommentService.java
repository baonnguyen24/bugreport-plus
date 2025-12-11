package com.bugreportplus.backend.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bugreportplus.backend.models.*;
import com.bugreportplus.backend.repositories.*;


@Service
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final BugRepository bugRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository, BugRepository bugRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.bugRepository = bugRepository;
    }

    /**
     * Create a new comments for a specific bug by a given author
    */
    @Transactional
    public Comment createComment(Long bugId, Long authorId, String content) {
        Optional<Bug> bugOpt = bugRepository.findById(bugId);
        Optional<User> userOpt = userRepository.findById(authorId);

        if(bugOpt.isEmpty()) {
            throw new IllegalStateException("Bug with id: " + bugId + "does not exist.");
        }

        if(userOpt.isEmpty()) {
            throw new IllegalStateException("User with id: " + authorId + "does not exist.");
        }

        Bug bug = bugOpt.get();
        User author = userOpt.get();

        Comment newComment = new Comment(content, bug, author);

        return commentRepository.save(newComment);
    }

    /**
     * Retrieves all comments for a given bug, ordered by creation time
     */
    @Transactional
    public List<Comment> getCommentByBugId(Long bugId) {
        return commentRepository.findByBugIdOrderByCreatedAtAsc(bugId);
    }

    /**
     * Deletes comment by Id
     */
    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}
