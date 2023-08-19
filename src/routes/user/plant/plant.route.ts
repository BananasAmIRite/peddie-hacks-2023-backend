import { Router, Request } from 'express';
import { getAllWeeklyPlants, getOrCreateCurrentWeek } from '../../../db/weekly_plant/WeeklyPlant';
import multer from 'multer';
import { recognizeTrash } from '../../../trash-recognizer/recognizeTrash';
import { WeeklyPlant } from '@prisma/client';
import prisma from '../../../db/db';

export interface PlantRequest extends Request {
    plant: WeeklyPlant;
}

const plantRouter = Router();

plantRouter.use(async (req, res, next) => {
    let current: WeeklyPlant | undefined;

    try {
        current = await getOrCreateCurrentWeek(req.userId!);
    } catch (err) {
        console.error('Error while getting current week: ' + err);
        return res.status(500).end();
    }

    if (!current) {
        console.error('No current week found');
        return res.status(500).end();
    }

    req.plant = current;

    next();
});

plantRouter.get('/current', async (req, res) => {
    // return data on the user (including user id)
    res.status(200)
        .send({
            plant: {
                weekId: req.plant?.weekId,
                score: req.plant?.plantScore,
                streak: req.plant?.streak,
            },
        })
        .end();
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

plantRouter.post('/uploadPlantImage', upload.single('trash'), async (req, res) => {
    if (!req.file) return res.status(400).send({ message: 'Missing image' });
    const file = req.file;
    if (file.mimetype !== 'image/jpeg') return res.status(400).send({ message: "File MIME type must be 'image/jpeg'" });

    const buf = file.buffer;
    const isTrash = recognizeTrash(buf);

    if (!isTrash) return res.status(401).send({ message: 'Could not recognize trash' });

    const lastUpdated = req.plant?.updatedAt?.getTime() ?? 0;

    try {
        await prisma.weeklyPlant.update({
            where: { id: req.plant?.id },
            data: {
                plantScore: (req.plant?.plantScore ?? 0) + 1,
                streak:
                    lastUpdated === 0
                        ? 1
                        : Date.now() - lastUpdated >= 36 * 60 * 60 * 1000
                        ? 0
                        : Date.now() - lastUpdated >= 12 * 60 * 60 * 1000
                        ? (req.plant?.streak ?? 0) + 1
                        : req.plant?.streak,
                updatedAt: new Date(),
            },
        });

        res.status(200).send({ message: 'Successfully gotten trash' });
    } catch (err: any) {
        console.log(err);
        res.status(500).send({ message: `Error while updating plant score: ${err.message}` });
    }
});

plantRouter.get('/weeklyPlants', async (req, res) => {
    await getOrCreateCurrentWeek(req.userId!); // make sure they have a plant for this week

    const weeklyPlant = await getAllWeeklyPlants(req.userId!);

    res.status(200).send({
        plants: weeklyPlant.map((e) => ({
            weekId: e.weekId,
            plantScore: e.plantScore,
        })),
    });
});

export default plantRouter;
