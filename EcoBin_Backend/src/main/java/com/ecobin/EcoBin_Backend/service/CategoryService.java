package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.model.Category;
import com.ecobin.EcoBin_Backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories(){
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category){
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updated){
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setCategoryType(updated.getCategoryType());
        existing.setBinColor(updated.getBinColor());

        return categoryRepository.save(existing);
    }

    public void deleteCategory(Long id){
        if (!categoryRepository.existsById(id)){
            throw new RuntimeException("Category not found");
        }
        categoryRepository.deleteById(id);
    }

}
