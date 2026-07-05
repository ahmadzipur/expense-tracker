"use client"

import {

    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis

}

    from "recharts"

export default function ExpenseChart() {

    const data = [

        {
            name: "Sen",
            value: 200
        },

        {
            name: "Sel",
            value: 400
        },

        {
            name: "Rab",
            value: 600
        },

        {
            name: "Kam",
            value: 350
        },

        {
            name: "Jum",
            value: 800
        }

    ]

    return (

        <ResponsiveContainer
            width="100%"
            height={260}
        >

            <AreaChart
                data={data}
            >

                <XAxis
                    dataKey="name"
                />

                <Area

                    dataKey="value"

                    stroke="#22d3ee"

                    fill="#22d3ee"

                    fillOpacity={
                        0.3
                    }

                />

            </AreaChart>

        </ResponsiveContainer>

    )

}