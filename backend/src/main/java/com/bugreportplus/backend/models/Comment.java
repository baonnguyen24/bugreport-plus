package com.bugreportplus.backend.models;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bug_id", nullable = false)
    @JsonIgnore
    private Bug bug;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    // Still need parameterized constructor for convinient object creation in services
    public Comment(String content, Bug bug, User author) {
        this.content = content;
        this.bug = bug;
        this.author = author;
    }
}
