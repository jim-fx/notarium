# Led

Leds have polarity, that means they only allow current to flow in one direction. That means LED's are diodes.

While in resistors the relations of voltage to current is linear:

![](current-voltage-characteristic.svg)

that is not the case for leds:


![](diode-voltage-graph.svg)

Each led has a specific Vd or voltage drop, it needs that amount of voltage to turn on, after that amount is reached the current will increase exponentially.

Because of this we will always need a resistor infront of the LED, because when the current is too high the LED will burn out.

Values that are important for the led:
$$
\begin{flalign}
&Vd = \text{Voltage Drop} \\
&Vf = \text{Forward Voltage}\\
&If = \text{Forward Current}
\end{flalign}
$$

Our power source must have more voltage than the voltage drop, otherwise we cant turn on the led.

## Example (TLUR6400)

First we need to find the datasheet of the specific component, it can be easily found by googling it

![TLUR DataSheet](tlur6400.pdf)

Now lets put that LED into a test circuit and calculate the resistance for it:

![](led-example.svg)

Because we now the Voltage Drop of the entire circuit must be 9v and the LED already drops 2V, we now know that the resistor must drop the remaining 7v.

$$
\begin{align}
R &= \frac{V}{I} &\text{Ohms Law} \\
R &= \frac{7}{0.02} &\text{Replace the values} \\
R &= 350 \text{Ω}
\end{align}
$$

If we would pack everything into one formulare it would look like this

$$
R = \frac{Vs - Vf}{i}
$$
