package com.bugreportplus.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bugreportplus.backend.models.Bug;
import com.bugreportplus.backend.models.User;

@Repository
public interface BugRepository extends JpaRepository<Bug, Long>{

    List<Bug> findByReporter(User reporter);

    List<Bug> findByAssignedUser(User assignedUser);

    List<Bug> findByStatusOrderByCreatedAtDesc(Bug.Status status);
    
}
