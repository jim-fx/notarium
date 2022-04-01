# Ohms Law

Solve for voltage:

$\displaystyle V = \frac{I}{R}$

_Solve for resistance:_

$R = \frac{V}{I}$

_Solve for current_

$$
\begin{flalign}
I & = \frac{V}{R} &
\end{flalign}
$$

# Resistors in Series

$R = R1 + R2 + R3 ...$

# Resistors in Parallel

$$
\begin{flalign}
&\frac{1}{R} = \frac{1}{R1} + \frac{1}{R2} + \frac{1}{R3} ... &\\
\\
&\textit{For two resistors in parallel:} &\\
\\
&R = \frac{R1 * R2}{R1 + R2} &\\\
\end{flalign}
$$

**_Tip:_**
If resistors of the same value are in parallel the total resistance is a single resistor divided by the amount if resistors.

## Thevenin’s Theorem

States that it is possible to simplify any linear circuit, no matter how complex, to an equivalent circuit with just a single voltage source and series resistance connected to a load.

# Kirchhoff's Law

## Conservation of Charge (First Law)

All current entering a node must also leave that node

$$
\begin{flalign}
\sum{I_{IN}} = \sum{I_{OUT}}&&
\end{flalign}
$$

**Example:**

![](./assets/kirchhoffs-law-01.svg)

For this circuit kirchhoffs law states that:

$\displaystyle i1 = i2 + i3 + i4$

## Conservation of Energy (Second Law)

All the potential differences around the loop must sum to zero.

$\displaystyle \sum{V} = 0$

## Capacitors in Series

$\displaystyle \frac{1}{C_{t}} = \frac{1}{C_{1}}+\frac{1}{C_{2}}+\frac{1}{C_{3}} ...$

### Impedance in a Circuit

$$
\begin{flalign}
&Z = \sqrt{R^2 + X^2} &\\\
\\
&X = X_{L} - X_{C} \\
\end{flalign}
$$

# Capacitive Reactance

$\displaystyle X_{c} = \frac{1}{2 \pi fC}$

# Inductive Reactance

$\displaystyle X_{l} = 2\pi fL$

# Analog Filters

## Cutoff Frequency for RC Filters

$\displaystyle f_{c} = \frac{1}{2\pi RC}$

## Cutoff Frequency for RL Filters

$\displaystyle f_{c} = \frac{R}{2\pi L}$

## Signal Response of an RC/RL Filter

$X_c$ = [[#Capacitive Reactance]] || [[#Inductive Reactance]]

$\displaystyle V_{out} = V_{in}(\frac{X_{c}}{\sqrt{R^2+X_{c}^2}})$

## Cutoff Frequency for multiple Low Pass Filters

$\displaystyle f_{(-3db)} = f_{c}\sqrt{2^{(\frac{1}{n})}-1}$

Where $n$ = Number if **identical** filters

## Resonance Frequency for RLC Low Pass Filter

$\displaystyle f_{o} = \frac{1}{2\pi \sqrt{LC}}$

## Center Frequency with Fc and Fh

$f_{c} = \sqrt{f_{h}*f_{l}}$

## Filter Response for RC Filters

$V_{out} = V_{in}(\frac{X_c}{\sqrt{R_{1}^2+X_{c}^2}})$

## Cutoff Frequency $\pi$ Topology Filter

When the two capacitors have the same capacitance, it can be calculated like this:

$\displaystyle f_c = \frac{1}{4\pi\sqrt{LC}}$

# Voltage Divider

$V_{out} = V_{in}(\frac{R_{1}}{R_1+R_2})$

# Angular Frequency ($\omega$)

$\omega = 2\pi f = \frac{2\pi}{T}$ ^4ad7fc

# RLC Series Response

This is basically Ohms Law:

$\displaystyle V = IZ$

Where $Z$ is the impedance:

$Z = \sqrt{R^2 + (X_L - X_C)^2}$

# Current through a transistor

$\displaystyle I_{EQ} = \frac{V_{BB}-{V_{BE}}}{\frac{R_B}{(\beta+1)}+R_E}$
