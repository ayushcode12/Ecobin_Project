package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.dto.CategoryDTO;
import com.ecobin.EcoBin_Backend.mapper.DtoMapper;
import com.ecobin.EcoBin_Backend.model.Category;
import com.ecobin.EcoBin_Backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private DtoMapper dtoMapper;

    @GetMapping
    public List<CategoryDTO> getAllCategories(){
        return categoryService.getAllCategories()
                .stream()
                .map(dtoMapper::toCategoryDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryDTO addCategory(@RequestBody Category newCategory){
        Category saved = categoryService.createCategory(newCategory);
        return dtoMapper.toCategoryDTO(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Category updateCategory(@PathVariable Long id, @RequestBody Category category){
        return categoryService.updateCategory(id, category);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCategory(@PathVariable long id){
        categoryService.deleteCategory(id);
    }

}
