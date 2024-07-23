import React from 'react'
import { ethers } from 'ethers'
import { ABI } from '../contract'


const AddNewEvent = (eventFilter, provider, cb) => {
    provider.removeAllListeners(eventFilter) //not have multiple listeners at the same event at the time
    provider.on(eventFilter, (logs) => {
        const parsedLog = (new ethers.utils.Interface(ABI)).parseLog(logs);

        cb(parsedLog);
    })
}

const createEventListeners = ({navigate, contract, provider, walletAddress, setShowAlert}) => {
    const NewPlayerEventFilter = contract.filters.NewPlayer();
    AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
        console.log('New player created!', args);

        if (walletAddress === args.owner) {
            setShowAlert({
                status: true,
                type: 'success',
                message: 'Player has been successfully registered',
            });
        }
    });
}

export default createEventListeners