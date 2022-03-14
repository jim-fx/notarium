# Voltage Divider

## Simple Voltage Divider

This is sort of unrealistic because there is no current flowing out of the voltage divider on the right side:

![Voltage Divider](voltage-divider.svg)

#### Equation

$$
\begin{flalign}
Vout & =\text{Vin }x*(\frac{R2}{R1+R2})&\\
\end{flalign}
$$

## Voltage Divider with Load

When the output of the voltage divider is connected to something the current drops on the output, as that something uses some of it.

![Voltage Divider](voltage-divider-load.svg)

The load is connected in parallel to R2, so we can calculate it as a parallel resistor.

The new Equation:

$$
\begin{flalign}
Vout & =\text{Vin }x*(\frac{R2 || RL}{R1+R2 || RL})&\\
\end{flalign}
$$

### Example

Lets calculate the current in this circuit:

![Voltage Divider Load Example](voltage-divider-load-example.svg)

1. We calculate the Resistance in the subcircuit (R2 and RL) as they are connected in parallel which means

$$
\begin{align}
\frac{1}{Re}&=\frac{1}{R2}+\frac{1}{RL} &\textit{Replace Variables}\\
\frac{1}{Re}&=\frac{1}{100}+\frac{1}{150} &\textit{Add Fractions}\\
\frac{1}{Re}&=\frac{1}{60} &\textit{* Re}\\
1&=\frac{Re}{60} &\textit{* 60}\\
60&=Re \\
\end{align}
$$

The simplified circuit now looks like this;

![Voltage Divider Load Example](voltage-divider-load-example-2.svg)

Now we can easily calculate the Resistance in the circuit

With the resistance we can now calculate the current  inside the load circuit by using the simple voltage divider equation:

$$
\begin{flalign}
Vout &=\text{Vin }x*(\frac{Re}{R1+Re})&\\
Vout &=5*(\frac{60}{100+60})&\\
Vout &=5*(\frac{60}{100+60})&\\
Vout &=1.875v
\end{flalign}
$$