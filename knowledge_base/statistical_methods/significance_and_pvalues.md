# Statistical Methods: Significance Testing, P-Values, and Interpretation

## Understanding P-Values in Climate Science
The p-value is the probability of obtaining test results at least as extreme as the observed results under the assumption that the null hypothesis ($H_0$, no true underlying trend) is correct.
- A small p-value ($p < 0.05$) indicates that the observed monotonic trend or slope is unlikely to have arisen solely through random natural sampling variability under $H_0$.
- In EarthPulse AI, we adopt the standard scientific threshold $\alpha = 0.05$ (95% confidence level).

## Scientific Interpretation Rules
1. **$p < 0.05$ with Positive Slope ($\beta > 0$)**:
   - Classification: **Statistically Significant Increasing Trend** (Rendered in Green).
   - Interpretation: High statistical confidence that the environmental variable has exhibited an upward shift across the analyzed window.
2. **$p < 0.05$ with Negative Slope ($\beta < 0$)**:
   - Classification: **Statistically Significant Decreasing Trend** (Rendered in Red).
   - Interpretation: High statistical confidence that the environmental variable has exhibited a downward shift across the analyzed window.
3. **$p \ge 0.05$**:
   - Classification: **No Statistically Significant Trend** (Rendered in Neutral Grey).
   - Interpretation: Insufficient evidence to reject the null hypothesis of no trend at the 95% confidence level. Random multi-year fluctuations or noise cannot be ruled out.

## What Statistical Significance Does NOT Mean
- **Significance Does Not Prove Anthropogenic Causation**: Rejecting $H_0$ confirms a directional trend is present in the numbers, but attributing that trend to greenhouse gas emissions vs. urban microclimate vs. natural multidecadal ocean oscillations requires physical fingerprinting and coupled climate model attribution.
- **Statistical Significance vs. Practical Significance**: In huge datasets ($n > 15,000$ daily points), tiny, imperceptible slopes can achieve $p < 0.001$. Always examine both the rate of change (Sen's slope per decade) and the p-value together.
