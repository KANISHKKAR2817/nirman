package com.nirman.risk;

import com.nirman.risk.RiskModels.RiskCategoryAssessment;
import com.nirman.risk.RiskModels.RiskScoringContext;

/**
 * Strategy interface demonstrating OOP polymorphism for calculating
 * domain-specific construction risks.
 */
public interface RiskAssessmentStrategy {
    String getCategory();
    RiskCategoryAssessment evaluate(RiskScoringContext context);
}
