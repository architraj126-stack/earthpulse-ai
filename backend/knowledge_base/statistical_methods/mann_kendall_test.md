# Statistical Methods: Mann-Kendall Trend Test

## Overview & Scientific Importance
The Mann-Kendall (MK) test is a non-parametric rank-based statistical test widely recommended by the World Meteorological Organization (WMO) and IPCC for assessing monotonic trends in environmental time series. Because it relies exclusively on the relative ranks of data points rather than their numerical magnitudes, the MK test is robust against non-normal distributions, missing observations, non-linearities, and extreme observational outliers.

## Mathematical Formulation
For a time series $X = \{x_1, x_2, \dots, x_n\}$, the Mann-Kendall test statistic $S$ is computed as the sum of signs of pairwise differences:
$$S = \sum_{k=1}^{n-1} \sum_{j=k+1}^n \text{sgn}(x_j - x_k)$$
where the sign function is defined as:
$$\text{sgn}(\theta) = \begin{cases} +1 & \text{if } \theta > 0 \\ 0 & \text{if } \theta = 0 \\ -1 & \text{if } \theta < 0 \end{cases}$$

## Kendall's Tau ($\tau$)
Kendall's rank correlation coefficient measures the degree of concordance:
$$\tau = \frac{S}{\frac{1}{2} n (n - 1)}$$
A value of $\tau > 0$ indicates a monotonic increasing tendency, whereas $\tau < 0$ indicates a monotonic decreasing tendency.

## Variance & Standardized Test Statistic $Z$
When $n \ge 10$, the distribution of $S$ closely approximates a normal distribution with mean zero and variance:
$$\text{Var}(S) = \frac{1}{18} \left[ n(n - 1)(2n + 5) - \sum_{p=1}^g t_p (t_p - 1)(2t_p + 5) \right]$$
where $g$ is the number of tied groups and $t_p$ is the size of the $p$-th tied group.

The standardized test statistic $Z$ is computed as:
$$Z = \begin{cases} \frac{S - 1}{\sqrt{\text{Var}(S)}} & \text{if } S > 0 \\ 0 & \text{if } S = 0 \\ \frac{S + 1}{\sqrt{\text{Var}(S)}} & \text{if } S < 0 \end{cases}$$

## Hypothesis Testing & Significance
- **Null Hypothesis ($H_0$)**: No monotonic trend exists; data points are independent and identically distributed.
- **Alternative Hypothesis ($H_a$)**: A monotonic upward or downward trend is present.
- **Two-tailed p-value**:
$$p = 2 \left( 1 - \Phi(|Z|) \right)$$
where $\Phi$ is the standard normal cumulative distribution function. At a significance level of $\alpha = 0.05$, $H_0$ is rejected if $p < 0.05$ (or $|Z| > 1.96$).

---
**Source Reference:** [https://doi.org/10.2307/1907187](https://doi.org/10.2307/1907187)
