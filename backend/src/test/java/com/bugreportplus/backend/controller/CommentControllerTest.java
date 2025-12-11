package com.bugreportplus.backend.controller;

import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;

import com.bugreportplus.backend.controllers.CommentController;

@WebMvcTest(CommentController.class)
@ActiveProfiles("test")
public class CommentControllerTest {
    
}
