package com.bugreportplus.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bugreportplus.backend.models.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long>{

    List<Comment> findByBugIdOrderByCreatedAtAsc(Long bugId);
    
}
